import pytest

from ..app import *

from . import ignore_asserts

@pytest.fixture(scope="module")
def client():

    app.config.update({"TESTING": True})

    with app.test_client() as client:
        yield client

        
        ignore_asserts(test_delete_users)(client)

email1="test1@test.com"
email2="test2@test.com"


password1="test123abc"
password2="testabc123"

user1=[email1, password1]
user2=[email2, password2]

token=""

def is_error(response):

    assert response.status_code == 500

    response=response.json
    
    #We don't check that the error is from gotrue, as we may want to add our own custom errors later
    assert response is not None

    for key in ["error", "message"]:
        assert response.get(key, "") != ""


def is_success(response):  #Similar to Rust's unwrap

    assert response.status_code == 200

    response=response.json

    assert response is not None

    for key in ["error", "message"]:
        assert response.get(key, "") == ""

    return response

def test_signup_invalid_credentials(client):
    """
    If a user tries to sign up, but does not give both username and password, it should return an error 
    """
    for user in [("", "" ), (email1, ""), ("", password1)]:
        is_error(client.post("/signup", json={"email": user[0], "password": user[1]}))

def test_signup_valid_credentials(client):
    global user1
    """
    If a user tries to sign up with a valid username and password, it should succeed
    """

    data={"email": email1, "password": password1}

    response = client.post("/signup", json=data)

    response = is_success(response)

    user1=[email1, password1]

    assert "token" not in response

def test_signup_duplicate(client):
    """
    If a user tries to sign up with an existing account, it should fail
    """

    data={"email": email1, "password": password1}

    is_error(client.post("/signup", json=data))

def test_login_invalid_credentials(client):
    """
    If a user tries to log in with either a blank username or blank password, it should fail
    """

    for data in [("", "" ), (email1, ""), ("", password1)]:
        is_error(client.post("/login", json={"email": data[0], "password": data[1]}))

def test_login_nonexistent_account(client):
    """
    If a user tries to log in with a non-existent account, it should fail
    """

    is_error(client.post("/login", json={"email": email2, "password": password1}))

def test_login_invalid_password(client):
    """
    If a user tries to log in with an incorrect password, it should fail
    """

    is_error(client.post("/login", json={"email": email1, "password": password2}))

def test_login_valid(client):
    global token

    """
    If a user tries to log in with a correct username and password, it should succeed
    """

    response=is_success(client.post("/login", json={"email": email1, "password": password1}))

    token=response.get("token", "")

    assert token != ""

    assert response.get("refresh_token", "") != ""

def test_modify_invalid(client):
    
    """
    If a user tries to modify their account with a blank email or password, it should fail

    """

    for key in ["email", "password"]:
        is_error(client.post("/modify", json={"token": token, key : ""}))

    is_error(client.post("/modify", json={"token": token, "email": "", "password": ""}))

def test_modify_valid(client):
    global token, user1

    """
    If a user tries to modify their account with a valid email and/or password, it should succeed

    Additionally, if they try to sign in with their new credentials, it should succeed
    """

    is_success(client.post("/modify", json={"token": token, "password": password2}))
    token=is_success(client.post("/login", json={"email": email1, "password": password2}))["token"]

    user1[1]=password2

    assert is_success(client.post("/modify", json={"token": token, "email": email2}))["email"]==email2
    token=is_success(client.post("/login", json={"email": email2, "password": password2}))["token"]

    user1[0]=email2

    assert is_success(client.post("/modify", json={"token": token, "email": email1, "password": password1}))["email"]==email1
    token=is_success(client.post("/login", json={"email": email1, "password": password1}))["token"]

    user1=[email1, password1]

    assert is_success(client.post("/modify", json={"token": token, "email": email2, "password": password2}))["email"]==email2
    token=is_success(client.post("/login", json={"email": email2, "password": password2}))["token"]

    user1=[email2, password2]

def test_signup_new(client):
    global user2
    """
    If a user tries to sign up with an account with the same email address that was used in an existing account that has since been modified to use a different email address, it should succeed
    """

    is_success(client.post("/signup", json={"email": email1, "password": password1}))

    user2=[email1, password1]

def test_delete_users(client): #These users are only defined for this test module alone (for other tests, a persistent user will already have been created)
    """
    If a user tries to delete their account, it should succeed
    """

    for user in [user1, user2]:
        token=is_success(client.post("/login", json={"email": user[0], "password": user[1]}))["token"]

        is_success(client.post("/delete", json={"token": token}))

def test_login_deleted_account(client):
    
    """
    If a user tries to log in with the credentials of a deleted account, it should fail
    """

    for user in [user1, user2]:
        is_error(client.post("/login", json={"email": user[0], "password": user[1]}))













    

