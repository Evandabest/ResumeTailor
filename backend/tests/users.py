import pytest
#from pytest_mock import MockFixture

from ..app import *

@pytest.fixture
def client():

    app.config.update({"TESTING": True})

    with app.test_client() as client:
        yield client

email1="test1@test.com"
email2="test2@test.com"
email3="test3@test.com"
password1="test123abc"
password2="test"

def test_signup(client):
    """
    If a user does not give both username and password, it should return an error 
    """
    for data in [{"email": "", "password": ""}, {"email": email1, "password":""}, {"email": "", "password": password1}]:
        resp = client.post("/signup", json=data)

        assert resp.status_code==500

        response=resp.json
    
        assert response is not None
        
        assert len(response.keys())==2

        assert response["error"] in ["AuthInvalidCredentialsError", "AuthApiError"]
