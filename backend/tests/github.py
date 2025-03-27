from . import *

email=config["TEST_USER_EMAIL"]
password=config["TEST_USER_PASSWORD"]

credentials={"email": email, "password": password} 
def setup(client):
    global credentials
    client.post("/signup", json=credentials)
    token=client.post("/login", json=credentials).json["token"]

    credentials={"token": token}

def test_link_valid(client):
    #Assumes token is valid
    print(client.post("/github/link", json=credentials).json)

    
    



