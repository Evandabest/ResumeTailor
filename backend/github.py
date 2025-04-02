from .utils import *
from github import Github, Auth
from github.GithubException import UnknownObjectException

@endpoint("/github/link", ["code"]) #Used for both linking, and updating
def link():
    #Token must be a GitHub token with at least read access to public repositories 
    #Assumes token is valid

    User.table("user_to_token").upsert({"id": get_id_from_token(token), "token": code}).execute()

#For internal use
def _token(token):
    lst=User.table("user_to_token").select("token").eq("id", get_id_from_token(token)).execute().data
    if len(lst)==0:
        return ""
    else:
        return lst[0]["token"]

#Used solely for displaying the username in the settings page
@endpoint("/github/token", [], ["code"])
def view():
    code=_token(token)

@endpoint("/github/unlink", []) #We *could* make it so that to unlink a token, you just send a blank "code" to /link
def unlink():
    User.table("user_to_token").delete().eq("id", get_id_from_token(token)).execute()
    
@endpoint("/github/projects/list", ["min_stars", "is_archived", "include", "exclude", "only"], ["repos"])
def list():
    repos=[]
    user=Github(auth=Auth.Token(_token(token))).get_user()

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
        repo_iterator=(repo for repo in user.get_repos(visibility="public") if ((repo.stargazers_count >= min_stars) and ((is_archived is None) or (repo.archived==is_archived)) and (repo.name not in exclude)) or (repo in include) ) #If "is_archived" is None, then accept repos regardless of archive status. Can add other filters later

    for repo in repo_iterator:
        try: #Check if repository has readme
            repo.get_readme()
        except UnknownObjectException:
            continue
        repos.append({"name": repo.name, "url": repo.html_url}) 
        
@endpoint("/github/projects/import", ["repos"]) #Used for updating the projects import. Takes in a non-empty list of repo names
def _import():
    uid=get_id_from_token(token)

    User.table("user_to_project").delete().eq("id", uid).execute() #Clear all projects associated with the user

    user=Github(auth=Auth.Token(_token(token))).get_user()
    
    data=[]
    for repo in repos:
        repo=user.get_repo(repo)
        info={"id": uid, "name": repo.name, "stars": repo.stargazers_count, "topics": repo.topics, "description": repo.description, "readme": repo.get_readme().decoded_content.decode()}

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

        data.append(info)

    User.table("user_to_project").insert(data).execute()

            

