from utils import *

@endpoint("/signup", ["email", "password"])
def signup():
    user=client.auth.sign_up({"email": email, "password": password})
    
    client.table("users").insert({"id": user["id"]}).execute()


@endpoint("/login", ["email", "password"], ["token"])
def login():
    user=client.auth.sign_up({"email": email, "password": password})

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
    response=client.auth.update_user(update_dict)

    if email is not None:
        email=response["email"]

@endpoint("/delete", [])
def delete():
   client.auth.admin.delete_user(auth.get_user(token)["user"]["id"])



