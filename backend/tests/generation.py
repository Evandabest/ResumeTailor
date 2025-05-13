from . import *
import json, os, pathlib

token=None
credentials=None

username="evanhaque1@gmail.com"
password="test123"

resume_filename="test_resume"

job_listing="""
About the position

At Vimeo, we love designing and engineering tools that combine power with ease of use. Our engineers work on professional-grade video tools for creators and have the opportunity to do way more than write code. We’re a small team that cares about collaboration, encourages curiosity, celebrates technical excellence, and is driven by careful attention to detail and planning for the future. We believe diversity of perspective and experience are key to building great technology and believe that the best way to iterate towards success is by taking care of ourselves, our families, our users, and one another. Join our team in NYC! This full-time, 40-hour per week internship requires an in-office presence Monday through Thursday, 9 AM to 5 PM EST. Fridays are remote work days.
Responsibilities

    Collaborate with product designers and engineers to build prototypes and test new features using our Design System and React component library
    Write clean, well-tested, and performant library and product code using React and CSS
    Find common UI patterns and consolidate them into scalable, composable components
    Grow technically and professionally in a collaborative and inclusive environment with opportunities to learn and share with others
    Build and improve tools for video creators that combine high-quality user experience with performance and scalability

Requirements

    MUST BE a Rising Junior or Rising Senior; enrolled in an undergraduate degree

Nice-to-haves

    A solid understanding of modern JavaScript, semantic HTML, and the DOM
    Experience with Typescript
    Strong knowledge of React conventions and best practices
    Experience with common CSS tooling like CSS-in-JS and SCSS
    Able to write simple, maintainable and thorough unit tests using Jest
    Experience working with component libraries, design systems and design tools like Figma and Storybook
    An understanding of basic performance optimization for web applications
    A strong eye for product design with a focus on interactivity

Benefits

    Paid internship with hourly range of $30-35
    Mentorship from a Vimean Mentor
    Hands-on experience and meaningful projects
    Networking with industry experts
"""

resume_id=None
def setup(client):
    global token, credentials, resume_id
    token=client.post("/login", json={"email": username, "password":password}).json["token"]

    credentials={"token": token}

    repos=[x["name"] for x in client.post("/github/projects/list", json=credentials).json["repos"]]

    client.post("/github/projects/import", json=credentials|{"repos": repos})

    client.post("/resume/upload", data={"json": json.dumps(credentials), "file": open(os.path.join(os.path.dirname(os.path.abspath(__file__)),resume_filename+".tex"),"rb")})

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

    points=is_success(client.post("/generate/points", json=credentials|{"ids":repos, "job_listing": job_listing}))["output"]

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

    f=is_success(response).files["file"]

    assert pathlib.Path(f.name).stem==filename

    assert f.seek(0, os.SEEK_END)>0





    

