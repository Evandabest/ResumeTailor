import pytest

from ..app import *

@pytest.fixture(scope="module")
def client():

    app.config.update({"TESTING": True})

    with app.test_client() as client:
        yield client

email1="test1@test.com"
email2="test2@test.com"
email3="test3@test.com"
password1="test123abc"
password2="test"

def is_error(response):

    assert response.status_code == 500

    response=response.json

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
    for data in [("", "" ), (email1, ""), ("", password1)]:
        is_error(client.post("/signup", json={"email": data[0], "password": data[1]}))

def test_signup_valid_credentials(client):
    """
    If a user tries to sign up with a valid username and password, it should succeed
    """

    data={"email": email1, "password": password1}

    response = client.post("/signup", json=data)

    response = is_success(response)

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
        is_error(client.post("/login", json={"email": email1, "password": password1}))

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

token=""
def test_login_valid(client):
    global token

    """
    If a user tries to log in with a correct username and password, it should succeed
    """

    response=is_success(client.post("/login", json={"email": email1, "password": password1}))

    token=response.get("token", "")

    assert token != ""









    

