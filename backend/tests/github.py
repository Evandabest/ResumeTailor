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

repos=[]
def test_list_projects(client):
    global repos
    """
    If a user tries to list all of their GitHub projects after linking an account, it should succeed
    """

    repos=is_success(client.post("/github/projects/list", json=credentials))["repos"]

    assert len(repos)>0 #Assumes that the test user used has at least one repo in their account

def test_import_projects_valid(client):
    """
    If a user tries to import their GitHub projects, it should succeed
    """

    assert is_success(client.post("/github/projects/import", json=credentials | {"repos": [repo["name"] for repo in repos]}))

def test_import_projects_invalid(client):
    """
    If a user tries to import a repo that they do not own, or does not exist, it should fail
    """
    for repos in [["kubernetes/kubernetes"], ["fhgidfgfudfb"]]:
        assert is_error(client.post("/github/projects/import", json=credentials| {"repos": repos}))




    
    



