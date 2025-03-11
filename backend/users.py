from utils import *

#We'll let users sign up without verifying email; however, to receive emails (including to reset password), they must verify it first
@endpoint("/signup", ["email", "password"])
def signup():

    user=User.auth.sign_up({"email": email, "password": password}).user

    Admin.table("users").insert({"id": user.id}).execute()


@endpoint("/login", ["email", "password"], ["token"])
def login():
    user=User.auth.sign_in_with_password({"email": email, "password": password})

    token=user.session.access_token

#It's unclear what should happen if the email you pass is the same as your current email (either an error, or a no-op is fine)
@endpoint("/modify", ["email", "password"], ["email"])
def modify():
    #email and/or password should be the NEW email and password, respectively

    update_dict={}
    if email is not None:
        update_dict["email"]=email
    if password is not None:
        update_dict["password"]=password
    #response=User.auth.update_user(update_dict) #This will not work, as modifying the email of as a user REQUIRES you to validate the new email --- unlike with signing up, there is NO option available in the dashboard for you to skip this

    response=Admin.auth.admin.update_user_by_id(User.auth.get_user(token).user.id, update_dict)

    if email is not None:
        email=response.email

@endpoint("/delete", [])
def delete():
    print(token)
    user_id=User.auth.get_user(token).user.id
    Admin.auth.admin.delete_user(user_id)

    Admin.table("users").delete().eq("id", user_id).execute()





