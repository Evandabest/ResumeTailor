from utils import *

#We'll let users sign up without verifying email; however, to receive emails (including to reset password), they must verify it first
@endpoint("/signup", ["email", "password"])
def signup():

    user=User.auth.sign_up({"email": email, "password": password}).user

    Admin.table("profiles").insert({"id": user.id}).execute()


@endpoint("/login", ["email", "password"], ["token", "refresh_token"])
def login():
    user=User.auth.sign_in_with_password({"email": email, "password": password})

    token=user.session.access_token

    #print(token)

    refresh_token=user.session.refresh_token

@endpoint("/refresh", ["refresh_token"], ["token", "refresh_token"])
def refresh():
    session=User.auth.refresh_session(refresh_token).session

    token=session.access_token

    refresh_token=session.refresh_token

@endpoint("/modify", ["email", "password"], ["email"])
def modify():
    #email and/or password should be the NEW email and password, respectively

    #If you changed your password, then the token is no longer valid, and you MUST log in again

    #NOTE: It's unclear what should happen if the email you pass is the same as your current email (either an error, or a no-op is fine)


    update_dict={}
    if email is not None:
        update_dict["email"]=email
    if password is not None:
        update_dict["password"]=password
    #response=User.auth.update_user(update_dict) #This will not work, as modifying the email of as a user REQUIRES you to validate the new email --- unlike with signing up, there is NO option available in the dashboard for you to skip this

    user=Admin.auth.admin.update_user_by_id(User.auth.get_user(token).user.id, update_dict).user

    if email is not None:
        print("New email:", user.email)
        print("Argument:", email)
        email=user.email

        if password is None:
            with app.test_client() as client:
                response=client.post("logout", json={"token": token, "scope": "global"}) #TODO: Sign out everywhere
                status_code=response.status_code

                response=response.json
                error=response["error"]
                message=response["message"]


@endpoint("/logout", ["token", "scope"])
def logout():
    if scope is None: #Only sign out the token's session
        scope="local"

    Admin.auth.admin.sign_out(token, scope=scope)

@endpoint("/delete", [])
def delete():

    user_id=User.auth.get_user(token).user.id
    Admin.auth.admin.delete_user(user_id)

    Admin.table("profiles").delete().eq("id", user_id).execute()





