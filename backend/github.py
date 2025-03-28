from .utils import *

@endpoint("/github/link", ["code"])
def link():
    #Code must be a GitHub token with at least read access to repositories (you can decide which repos to leave out by using the Fine-grained PAT page) 
    User.table("user_to_token").upsert({"id": get_id_from_token(token), "token": code}).execute()

