from . import *

email=config["TEST_USER_EMAIL"]
password=config["TEST_USER_PASSWORD"]

credentials={"email": email, "password": password} 

columns=["github", "github_username"]

def setup(client):
    global credentials
    client.post("/signup", json=credentials)
    token=client.post("/login", json=credentials).json["token"]

    credentials={"token": token}

def test_update_and_view(client):
    """
    A. If a user tries to add or update a column in the user_to_token table, it should succeed.

    B. If a user tries to view the updated value(s), it should succeed.
    """

    for value in ["1", ""]:
        for col in columns:
            is_success(client.post("/user_to_token/update", json=credentials | {"column": col, "value": value}))
            
            assert is_success(client.post("/user_to_token/view", json=credentials | {"column": col}))["value"] == value

    is_success(client.post("/user_to_token/update", json=credentials |{ "column": "github", "value": config["TEST_USER_GITHUB_TOKEN"]}))

    pass

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

    is_success(client.post("/github/projects/import", json=credentials | {"repos": [repo["name"] for repo in repos]}))

def test_view_projects(client):
    """
    If a user tries to view their imported projects, it should succeed
    """

    assert len(is_success(client.post("/github/projects/view", json=credentials))["repos"])>0
    
def test_import_projects_invalid(client):
    """
    If a user tries to import a repo that they do not own, or does not exist, it should fail
    """
    for repos in [["kubernetes/kubernetes"], ["fhgidfgfudfb"]]:
        is_error(client.post("/github/projects/import", json=credentials| {"repos": repos}))

def test_selection_set_and_get(client):
    """
    A. If a user tries to set a selection dictionary, it should succeed.

    B. If a user tries to retrieve the selection dictionary, it should succeed.
    """

    data={"linux": True}
