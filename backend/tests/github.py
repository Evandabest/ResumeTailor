from . import *

email=config["TEST_USER_EMAIL"]
password=config["TEST_USER_PASSWORD"]

credentials={"email": email, "password": password} 
def setup(client):
    global credentials
    client.post("/signup", json=credentials)
    token=client.post("/login", json=credentials).json["token"]

    credentials={"token": token}

def teardown(client):
    ignore_asserts(test_unlink)(client)

def test_link(client):
    is_success(client.post("/github/link", json=credentials | {"code": config["TEST_USER_TOKEN"]}))

    pass

def test_token(client):
    assert is_success(client.post("/github/token", json=credentials))["code"]==config["TEST_USER_TOKEN"]

def test_link_update(client):
    """
    If a user tries to update their token, it should succeed
    """

    is_success(client.post("/github/link", json=credentials | {"code": "Testing123"}))

    assert is_success(client.post("/github/token", json=credentials))["code"]=="Testing123"
    
    is_success(client.post("/github/link", json=credentials | {"code": config["TEST_USER_TOKEN"]}))

def test_unlink(client):
    is_success(client.post("/github/unlink", json=credentials))

    pass

def test_token_blank(client):
    """
    If a user tries to view their token after unlinking it, they should get an empty string
    """

    assert is_success(client.post("/github/token", json=credentials))["code"]==""



    
    



