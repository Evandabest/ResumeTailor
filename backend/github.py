from .utils import *

from github import Github, Auth
from github.GithubException import UnknownObjectException
from github.NamedUser import NamedUser
from github.GithubObject import NotSet

@endpoint("/user_to_token/update", ["value", "column"]) #Used for linking, updating, and unlinking
def link():
    #GitHub token must have at least read access to public repositories 
    #Assumes token is valid
    if value=="":
        value=None
    user_to_token_table.upsert({"uid": get_id_from_token(token), column: value}).execute()

#Used solely for displaying the username in the settings page
@endpoint("/user_to_token/view", ["column"], ["value"])
def view():
    value=retrieve(token, column) or ""

def get_github_user_from_token(token):
    _token=retrieve(token, "github")
    _username=NotSet

    if not _token:
        _token=config["TEST_USER_GITHUB_TOKEN"]
        _username=retrieve(token, "github_username")

    return Github(auth=Auth.Token(_token)).get_user(_username)

@endpoint("/github/projects/list", ["min_stars", "is_archived", "include", "exclude", "only"], ["repos"])
def list():
    repos=[]

    user=get_github_user_from_token(token)

    _visibility="public"
    if isinstance(user, NamedUser):
        _visibility=None

    if min_stars is None:
        min_stars = 0

    if only is None:
        only=[]
    if exclude is None:
        exclude=[]
    if include is None:
        include=[]
    
    exclude=set(exclude) #Exclude any of these repos
    include=set(include) #You MUST include these repos, no matter what

    if len(only)>0: #Only get these repos
        repo_iterator=[user.get_repo(repo) for repo in repos]
    else:
        #We only care about public repos (what's the point of putting a repo in your resume that no one can see?)
        repo_iterator=(repo for repo in user.get_repos(visibility=_visibility, affiliation="owner") if ((repo.stargazers_count >= min_stars) and ((is_archived is None) or (repo.archived==is_archived)) and (repo.name not in exclude)) or (repo in include) ) #If "is_archived" is None, then accept repos regardless of archive status. Can add other filters later

    for repo in repo_iterator:
        try: #Check if repository has readme
            repo.get_readme()
        except UnknownObjectException:
            continue
        repos.append({"name": repo.name, "url": repo.html_url}) 
        
@endpoint("/github/projects/import", ["repos"]) #Used for updating the projects import. Takes in a non-empty list of repo names
def _import():
    uid=get_id_from_token(token)

    user=get_github_user_from_token(token)
    
    data=[]

    for repo in repos:
        repo=user.get_repo(repo)

        info={"name": repo.name, "stars": repo.stargazers_count, "topics": repo.topics, "description": repo.description or "", "readme": repo.get_readme().decoded_content.decode()}

        languages=repo.get_languages()
        langs=[]
        total_lang_lines=sum(languages.values())
        
        counter=0
        for key, value in sorted(languages.items(), key=lambda x: x[1], reverse=True):
            counter+=value
            langs.append(key)

            if counter>=0.5*total_lang_lines: #Get the top languages that together make up >= 50% of total lines
                break

        info["languages"]=langs

        data.append({"name": info["name"], "url": repo.html_url, "text": "\n\n".join([f"{key}: {val}" for key, val in info.items()])})  #We can do some kind of additional truncation, or summarization beforehand to avoid Gemini potentially rejecting inputs

    embeddings=get_embeddings(token, [x["text"] for x in data])

    data=[{"id": uid, "embedding": embeddings[i]} | x for i, x in enumerate(data)] #Merge them back together

    """
    The text in each row of user_to_project will be combined to create a single text. Each project will be "<column_name>: <str(value)>" concatenated into a single string. Use gemini embeddings (https://ai.google.dev/gemini-api/docs/embeddings), and follow this: https://supabase.com/docs/guides/ai/semantic-search#semantic-search-in-postgres (try gte-small as well). Vectors are stored alongside the project
    """

    User.table("user_to_project").delete().eq("uid", uid).execute() #Clear all projects associated with the user

    User.table("user_to_project").insert(data).execute()

@endpoint("/github/projects/view", [], ["repos"])
def view_projects():
    repos=User.table("user_to_project").select("name, url").eq("uid", get_id_from_token(token)).execute().data

#/github/selection --- stores JSON mapping between name of project and whether it was selected on the frontend during project import. /get can be used to retrieve it, and /set can be used to, well, set it.
@endpoint("/github/selection/set", ["data"])
def _set():
    User.table("user_to_selection").upsert({"uid": get_id_from_token(token), "data": data}).execute()

@endpoint("/github/selection/get", [], ["data"])
def _get():
    data=User.table("user_to_selection").select("data").eq("uid", get_id_from_token(token)).execute().data

    if len(data)==0:
        data={}
    else:
        data=data[0]["data"]

