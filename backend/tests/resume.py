from . import *
import json, io

email=config["TEST_USER_EMAIL"]
password=config["TEST_USER_PASSWORD"]

credentials={"email": email, "password": password} 
def setup(client):
    global credentials
    client.post("/signup", json=credentials)
    token=client.post("/login", json=credentials).json["token"]

    credentials={"token": token}

def teardown(client):
    ignore_asserts(test_delete_valid)(client)

def test_upload_too_big(client):
    """
    If a user tries to upload a resume that's too big, it should fail
    """

    dummy_resume=io.BytesIO(b"a"*(app.config["MAX_CONTENT_LENGTH"]+10))
    dummy_resume.name="/tmp/a.tex"

    is_error(client.post("/resume/upload", data={"json":json.dumps(credentials), "file": dummy_resume}), 413) #Flask returns a 413 for files that are too big.

def test_upload_wrong_filetype(client):
    """
    If a user tries to upload a resume with the wrong file ending, it should fail
    """

    dummy_resume=io.BytesIO(b"")
    dummy_resume.name="/tmp/a.texw"

    is_error(client.post("/resume/upload", data={"json": json.dumps(credentials), "file": dummy_resume}))

def test_upload_valid(client):
    """
    If a user tries to upload a resume that meets all of the requirements, it should succeed
    """

    dummy_resume=io.BytesIO(b"")
    dummy_resume.name="/tmp/a.tex"

    is_success(client.post("/resume/upload", data={"json": json.dumps(credentials), "file": dummy_resume}))

    assert [x["filename"] for x in is_success(client.post("/resume/list", json=credentials))["data"]]==["a.tex"]

def test_upload_update_invalid(client):
    """
    If a user tries to update a resume that is invalid (either does not exist, or does not belong to the same user), it should fail
    """

    dummy_resume=io.BytesIO(b"")
    dummy_resume.name="/tmp/a.tex"

    is_error(client.post("/resume/upload", data={"json": json.dumps(credentials|{"update": -1}), "file": dummy_resume}))

id=None

def test_list_valid(client):
    global id
    """
    If a user tries to list all of their uploaded resumes, it should succeed
    """

    id=is_success(client.post("/resume/list", json=credentials))["data"][0]["id"]

def test_upload_update_valid(client):
    """
    If a user tries to update an id that they own, it should succeed
    """
    
    dummy_resume=io.BytesIO(b"")
    dummy_resume.name="/tmp/b.tex"

    is_success(client.post("/resume/upload", data={"json": json.dumps(credentials|{"update": id}), "file": dummy_resume}))

    assert [x["filename"] for x in is_success(client.post("/resume/list", json=credentials))["data"]]==["b.tex"]

def test_rename_invalid_id(client):
    """
    If a user tries to rename a resume that is invalid, it should fail
    """

    is_error(client.post("/resume/rename", json=credentials|{"id": -1, "name": "/tmp/a.tex"}))

def test_rename_invalid_filetype(client):
    """
    If a user tries to rename a resume in a non-TEX file ending, it should fail
    """

    is_error(client.post("/resume/rename", json=credentials|{"id": id, "name": "/tmp/a.texw"}))

def test_rename_valid(client):
    """
    If a user tries to rename a valid resume with a valid filename, it should succeed
    """

    is_success(client.post("/resume/rename", json=credentials|{"id": id, "name": "/tmp/a.tex"}))

    assert [x["filename"] for x in is_success(client.post("/resume/list", json=credentials))["data"]]==["a.tex"]

def test_delete_invalid(client):
    """
    If a user tries to delete an invalid resume, it should fail
    """

    is_error(client.post("/resume/delete", json=credentials|{"id": -1}))

def test_delete_valid(client):
    """
    If a user tries to delete a valid resume it should succeed
    """

    for x in is_success(client.post("/resume/list", json=credentials))["data"]:
        is_success(client.post("/resume/delete", json=credentials|{"id": x["id"]}))

