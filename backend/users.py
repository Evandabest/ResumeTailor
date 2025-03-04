from utils import *

@endpoint("/signup", ["email", "password"], ["token"])
def signup():
    user=supabase.auth.sign_up({"email": email, "password": password})
    if user["error"]!="":
        error=user["error"]
    else:
        response=table("users").insert({"id": user["id"]}).execute()
        if (response["error"]!=""):
            error=response["error"]
        else:
            token=user["access_token"]

@endpoint("/login", ["email", "password"], ["token"])
def login():
    user=supabase.auth.sign_up({"email": email, "password": password})
    error=user["error"]



