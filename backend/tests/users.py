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
        response = client.post("/signup", json=data)

        print(response)

        response=response.json
    
        assert response is not None
        
        print(response["error"])

        assert len(response.keys())==1

        assert response["error"]!=""
