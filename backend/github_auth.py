from utils import *
import requests
from datetime import datetime, timedelta
import base64

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"
CACHE_DURATION = timedelta(seconds=10)

@endpoint("/github/link", ["code"])
def github_link():
    # Exchange code for access token
    response = requests.post(
        GITHUB_TOKEN_URL,
        headers={"Accept": "application/json"},
        data={
            "client_id": config["GITHUB_CLIENT_ID"],
            "client_secret": config["GITHUB_CLIENT_SECRET"],
            "code": code
        }
    )
    
    if response.status_code != 200:
        raise Exception("Failed to get GitHub access token")
    
    github_access_token = response.json()["access_token"]
    
    # Get GitHub user info
    user_response = requests.get(
        f"{GITHUB_API_URL}/user",
        headers={
            "Authorization": f"Bearer {github_access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
    )
    
    if user_response.status_code != 200:
        raise Exception("Failed to get GitHub user info")
    
    github_user = user_response.json()
    user_id = User.auth.get_user(token).user.id
    
    # Update user profile with GitHub info
    Admin.table("profiles").update({
        "github_id": str(github_user["id"]),
        "github_username": github_user["login"],
        "github_access_token": github_access_token,
        "github_last_update": datetime.utcnow().isoformat()
    }).eq("id", user_id).execute()

@endpoint("/github/unlink", [])
def github_unlink():
    user_id = User.auth.get_user(token).user.id
    
    # Remove GitHub info from profile and cached projects
    Admin.table("profiles").update({
        "github_id": None,
        "github_username": None,
        "github_access_token": None,
        "github_last_update": None
    }).eq("id", user_id).execute()
    
    Admin.table("github_projects").delete().eq("user_id", user_id).execute()

@endpoint("/github/update", [])
def github_update():
    user_id = User.auth.get_user(token).user.id
    
    # Get user profile with GitHub info
    result = Admin.table("profiles").select("github_access_token", "github_last_update").eq("id", user_id).execute()
    if not result.data:
        raise Exception("User profile not found")
        
    profile = result.data[0]
    github_access_token = profile.get("github_access_token")
    last_update = profile.get("github_last_update")
    
    if not github_access_token:
        raise Exception("GitHub account not linked")
    
    # Check if we need to update (10 second cache)
    if last_update:
        last_update_time = datetime.fromisoformat(last_update)
        if datetime.utcnow() - last_update_time < CACHE_DURATION:
            return
    
    # Fetch repos from GitHub
    repos_response = requests.get(
        f"{GITHUB_API_URL}/user/repos",
        headers={
            "Authorization": f"Bearer {github_access_token}",
            "Accept": "application/vnd.github.v3+json"
        },
        params={"sort": "updated", "per_page": 100}
    )
    
    if repos_response.status_code != 200:
        raise Exception("Failed to fetch GitHub repositories")
    
    # Update cached projects
    Admin.table("github_projects").delete().eq("user_id", user_id).execute()
    
    for repo in repos_response.json():
        # Get language data
        langs_response = requests.get(
            repo["languages_url"],
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        languages = langs_response.json() if langs_response.status_code == 200 else {}
        
        # Get README content
        readme_response = requests.get(
            f"{repo['url']}/readme",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        readme = ""
        if readme_response.status_code == 200:
            readme_data = readme_response.json()
            if readme_data.get("content"):
                readme = base64.b64decode(readme_data["content"]).decode("utf-8")
        
        # Store project data
        Admin.table("github_projects").insert({
            "user_id": user_id,
            "repo_id": repo["id"],
            "name": repo["name"],
            "description": repo["description"],
            "languages": languages,
            "readme": readme,
            "html_url": repo["html_url"],
            "updated_at": repo["updated_at"]
        }).execute()
    
    # Update last update timestamp
    Admin.table("profiles").update({
        "github_last_update": datetime.utcnow().isoformat()
    }).eq("id", user_id).execute()

@endpoint("/github/projects", [], ["projects"])
def github_projects():
    user_id = User.auth.get_user(token).user.id
    
    # First try to update cached data
    try:
        with app.test_client() as client:
            response = client.post("/github/update", json={"token": token})
            if response.status_code not in [200, 500]:  # 500 means we're within cache window
                raise Exception("Failed to update GitHub data")
    except:
        pass  # Ignore update failures, we'll use cached data
    
    # Get cached projects
    result = Admin.table("github_projects").select("*").eq("user_id", user_id).order("updated_at.desc").execute()
    
    return {"projects": result.data}