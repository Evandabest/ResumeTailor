from .utils import *
import requests
from datetime import datetime, timedelta
import base64
import uuid  # Add UUID import

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"
CACHE_DURATION = timedelta(seconds=10)

class GitHubAuthError(Exception):
    """Exception raised for GitHub authentication errors"""
    pass

class GitHubAPIError(Exception):
    """Exception raised for GitHub API errors"""
    pass

@endpoint("/github/link", ["code"])
def github_link():
    # The endpoint decorator injects parameters from the request
    try:
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
            raise GitHubAuthError(f"Failed to get GitHub access token: {response.text}")
        
        github_access_token = response.json().get("access_token")
        if not github_access_token:
            raise GitHubAuthError("No access token in GitHub response")
        
        # Get GitHub user info
        user_response = requests.get(
            f"{GITHUB_API_URL}/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        if user_response.status_code != 200:
            raise GitHubAPIError(f"Failed to get GitHub user info: {user_response.text}")
        
        github_user = user_response.json()
        user_id = User.auth.get_user(token).user.id
        
        # Validate user_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(user_id)
            user_id_str = str(uuid_obj)
        except ValueError:
            raise ValueError(f"Invalid user ID format: {user_id}")
        
        # Update user profile with GitHub info
        Admin.table("profiles").update({
            "github_id": str(github_user["id"]),
            "github_username": github_user["login"],
            "github_access_token": github_access_token,
            "github_last_update": datetime.utcnow().isoformat()
        }).eq("id", user_id_str).execute()
    except (requests.RequestException, KeyError) as e:
        raise GitHubAPIError(f"GitHub API communication error: {str(e)}")

@endpoint("/github/unlink", [])
def github_unlink():
    user_id = User.auth.get_user(token).user.id
    
    # Validate user_id is a valid UUID
    try:
        uuid_obj = uuid.UUID(user_id)
        user_id_str = str(uuid_obj)
    except ValueError:
        raise ValueError(f"Invalid user ID format: {user_id}")
    
    # Remove GitHub info from profile and cached projects
    Admin.table("profiles").update({
        "github_id": None,
        "github_username": None,
        "github_access_token": None,
        "github_last_update": None
    }).eq("id", user_id_str).execute()
    
    Admin.table("github_projects").delete().eq("user_id", user_id_str).execute()

@endpoint("/github/update", [])
def github_update():
    user_id = User.auth.get_user(token).user.id
    
    # Validate user_id is a valid UUID
    try:
        uuid_obj = uuid.UUID(user_id)
        user_id_str = str(uuid_obj)
    except ValueError:
        raise ValueError(f"Invalid user ID format: {user_id}")
    
    # Get user profile with GitHub info
    result = Admin.table("profiles").select("github_access_token", "github_last_update").eq("id", user_id_str).execute()
    if not result.data:
        raise GitHubAuthError("User profile not found")
        
    profile = result.data[0]
    github_access_token = profile.get("github_access_token")
    last_update = profile.get("github_last_update")
    
    if not github_access_token:
        raise GitHubAuthError("GitHub account not linked")
    
    # Check if we need to update (10 second cache)
    if last_update:
        try:
            last_update_time = datetime.fromisoformat(last_update)
            if datetime.utcnow() - last_update_time < CACHE_DURATION:
                return
        except (ValueError, TypeError):
            # Invalid datetime format, proceed with update
            pass
    
    try:
        # Fetch repos from GitHub
        repos_response = requests.get(
            f"{GITHUB_API_URL}/user/repos",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            params={"sort": "updated", "per_page": 100},
            timeout=10  # Add timeout to prevent hanging requests
        )
        
        if repos_response.status_code == 401:
            # Token revoked or expired
            raise GitHubAuthError("GitHub token is invalid or expired")
        elif repos_response.status_code != 200:
            raise GitHubAPIError(f"Failed to fetch GitHub repositories: {repos_response.text}")
        
        # Update cached projects - use a transaction to prevent race conditions
        with Admin.pool.acquire() as connection:
            # Delete existing projects first
            Admin.table("github_projects").delete().eq("user_id", user_id_str).execute()
            
            for repo in repos_response.json():
                # Validate required fields
                if not repo.get("id") or not repo.get("name"):
                    continue
                
                # Get language data
                try:
                    langs_response = requests.get(
                        repo["languages_url"],
                        headers={
                            "Authorization": f"Bearer {github_access_token}",
                            "Accept": "application/vnd.github.v3+json"
                        },
                        timeout=5
                    )
                    languages = langs_response.json() if langs_response.status_code == 200 else {}
                except (requests.RequestException, ValueError):
                    languages = {}
                
                # Get README content
                readme = ""
                try:
                    readme_response = requests.get(
                        f"{repo['url']}/readme",
                        headers={
                            "Authorization": f"Bearer {github_access_token}",
                            "Accept": "application/vnd.github.v3+json"
                        },
                        timeout=5
                    )
                    if readme_response.status_code == 200:
                        readme_data = readme_response.json()
                        if readme_data.get("content"):
                            readme = base64.b64decode(readme_data["content"]).decode("utf-8")
                except (requests.RequestException, ValueError, UnicodeDecodeError, base64.Error):
                    # Continue with empty readme on error
                    pass
                
                # Store project data
                Admin.table("github_projects").insert({
                    "user_id": user_id_str,
                    "repo_id": repo["id"],
                    "name": repo["name"],
                    "description": repo.get("description", ""),
                    "languages": languages,
                    "readme": readme,
                    "html_url": repo.get("html_url", ""),
                    "updated_at": repo.get("updated_at", "")
                }).execute()
            
            # Update last update timestamp
            Admin.table("profiles").update({
                "github_last_update": datetime.utcnow().isoformat()
            }).eq("id", user_id_str).execute()
        
    except requests.RequestException as e:
        raise GitHubAPIError(f"GitHub API request failed: {str(e)}")

@endpoint("/github/projects", [], ["projects"])
def github_projects():
    user_id = User.auth.get_user(token).user.id
    
    # Validate user_id is a valid UUID
    try:
        uuid_obj = uuid.UUID(user_id)
        user_id_str = str(uuid_obj)
    except ValueError:
        raise ValueError(f"Invalid user ID format: {user_id}")
    
    # First try to update cached data
    try:
        with app.test_client() as client:
            response = client.post("/github/update", json={"token": token})
            if response.status_code not in [200, 500]:  # 500 means we're within cache window
                if response.json.get("error"):
                    app.logger.warning(f"GitHub update failed: {response.json.get('message')}")
    except Exception as e:
        app.logger.warning(f"GitHub update attempt failed: {str(e)}")
    
    # Get cached projects
    result = Admin.table("github_projects").select("*").eq("user_id", user_id_str).order("updated_at.desc").execute()
    
    # Set a local variable instead of returning a dictionary
    projects = result.data