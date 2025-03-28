from .utils import *

@endpoint("/github/link", ["code"]) #Used for both linking, and updating
def link():
    #Code must be a GitHub token with at least read access to repositories (you can decide which repos to leave out by using the Fine-grained PAT page) 

    #Assumes code is valid
    User.table("user_to_token").upsert({"id": get_id_from_token(token), "token": code}).execute()

#For internal use
def _token(token):
    lst=User.table("user_to_token").select("token").eq("id", get_id_from_token(token)).execute().data
    if len(lst)==0:
        return ""
    else:
        return lst[0]["token"]

#Is used solely for displaying the token in the settings page
@endpoint("/github/token", [], ["code"])
def token_():
    code=_token(token)

@endpoint("/github/unlink", []) #We *could* make it so that to unlink a token, you just send a blank code to link
def unlink():
    User.table("user_to_token").delete().eq("id", get_id_from_token(token)).execute()
    


