from utils import *

#We'll let users sign up without verifying email; however, to receive emails (including to reset password), they must verify it first
@endpoint("/signup", ["email", "password"])
def signup():
    user=client.auth.sign_up({"email": email, "password": password})
    
    client.table("users").insert({"id": user["id"]}).execute()


@endpoint("/login", ["email", "password"], ["token"])
def login():
    user=client.auth.sign_up({"email": email, "password": password})

    token=user["access_token"]
#signup, signup, login, login (doesn't exist) modify, signup with new details, signup with old details, login with new details, delete both

#It's unclear what should happen if the email you pass is the same as your current email (either an error, or a no-op is fine)
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
    user_id=auth.get_user(token)["user"]["id"]
    client.auth.admin.delete_user(user_id)

    client.table("users").delete().eq("id", user_id).execute()





