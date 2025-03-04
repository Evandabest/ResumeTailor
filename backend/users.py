from utils import *

@endpoint("/signup", ["email", "password"])
def signup():
    user=auth.sign_up({"email": email, "password": password})
    if user["error"]!="":
        error=user["error"]
    else:
        response=table("users").insert({"id": user["id"]}).execute()
        if (response["error"]!=""):
            error=response["error"]

@endpoint("/login", ["email", "password"], ["token"])
def login():
    user=supabase.auth.sign_up({"email": email, "password": password})
    error=user["error"]

    token=user["access_token"]
#signup, signup, login, modify, signup with new details, signup with old details, login with new details, delete both
@endpoint("/modify", ["email", "password"], ["email"])
def modify():
    #email and/or password should be the NEW email and password, respectively

    update_dict={}
    if email is not None:
        update_dict["email"]=email
    if password is not None:
        update_dict["password"]=password
    response=auth.update_user(update_dict)

    error=response["error"] #TODO: Add code to endpoint to not send error if empty

    if email is not None:
        email=response["email"]

@endpoint("/delete", [])
def delete():
   auth.admin.delete_user(auth.get_user(token)["user"]["id"])



