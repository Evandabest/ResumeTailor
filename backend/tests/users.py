import pytest
#from pytest_mock import MockFixture

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

def is_error(response): #Similar to Rust's unwrap

    assert response.status_code == 500

    response=response.json

    assert response is not None

    for key in ["error", "message"]:
        assert response.get(key, "") != ""

def is_success(response):
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
    for data in [{"email": "", "password": ""}, {"email": email1, "password":""}, {"email": "", "password": password1}]:
        response = client.post("/signup", json=data)

        is_error(response)

def test_signup_valid_credentials(client):
    """
    If a user signs up with a valid username and password, it should succeed
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

    response = client.post("/signup", json=data)

    is_error(response)

def test_login_valid(client):
    """





    

