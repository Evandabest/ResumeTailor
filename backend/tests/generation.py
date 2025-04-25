from . import *
import json, os

token=None
credentials=None

username="..."
password="test123"

resume_filename="test_resume"

job_listing="..."

resume_id=None
def setup(client):
    global token, credentials, resume_id
    token=client.post("/login", json={"email": username, "password":password}).json["token"]

    credentials={"token": token}

    repos=[x["name"] for x in client.post("/github/projects/list", json=credentials).json["repos"]]

    client.post("/github/projects/import", json=credentials|{"repos": repos})

    client.post("/resume/upload", data={"json": json.dumps(credentials), "file": open(resume_filename+".tex")})

    resume_id=[x["id"] for x in client.post("/resume/list", json=credentials).json["info"] if x["filename"]==resume_filename][0]


repos=None
def test_rag(client): #We could also have one that tests what happens when the user did not import any repositories
    """
    If a user tries to call the endpoint, it should succeed
    """
    
    global repos

    repos=is_success(client.post("/generate/rag", json=credentials|{"job_listing": job_listing}))["repos"]

    repos=[x["id"] for x in repos]

    assert len(repos)>0

points=None
def test_points_valid(client):
    """
    If a user tries to call the endpoint with repository ids that are all valid and belong to them, it should succeed
    """
    global points

    points=is_success(client.post("/generate/points", json=credentials|{"ids":repos, "job_listing": job_listing}))["points"]

    assert isinstance(points, str) and len(points)>0


def test_points_invalid(client):
    """
    If a user tries to call the endpoint with invalid repository ids, it should fail
    """

    is_error(client.post("/generate/points", json=credentials|{"ids":[-1], "job_listing": job_listing}))


latex=None
filename=None
def test_latex_valid(client):
    """
    If a user tries to call the endpoint with a resume id that belongs to them, it should succeed
    """
    global latex, filename
    
    response=is_success(client.post("/generate/latex", json=credentials|{"resume_id":resume_id, "input": points}))

    latex=response["output"]
    filename=response["filename"]

    assert isinstance(latex, str) and len(latex)>0


def test_latex_invalid(client):
    """
    If a user tries to call the endpoint with an invalid resume_id, it should fail
    """

    is_error(client.post("/generate/latex", json=credentials|{"resume_id":-1, "input": points}))

def test_pdf_valid(client):
    """
    If a user tries to call the endpoint, it should succeed
    """
    
    response=client.post("/generate/pdf", json=credentials|{"filename": filename, "content": latex})

    is_success(response)
    f=response.files["file"]

    assert f.name==filename

    f.seek(0, os.SEEK_END)

    assert f.tell()>0





    

