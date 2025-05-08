from .utils import *
import io, base64

@endpoint("/generate/rag", ["job_listing"], ["repos"])
def rag():
    #By default, all of the returned repos should be checked on the frontend

    ids=User.rpc("match_projects", {"uid": get_uid_from_token(token), "query_embedding": get_embeddings(token, [job_listing])[0], "minimum_score": 0.5, "count": 10}).execute().data #Can tweak the minimum and/or count

    repos=User.table.select("id, name, url").in_("id", ids).execute().data

@endpoint("/generate/points", ["ids", "job_listing"], ["output"])
def points():
    #The user should be asked if they want to recreate the points, as well as edit the points manually if needed

    projects=User.table("user_to_projects").select("text").and_(f"id.in.{tuple(ids)}, uid.eq.{get_uid_from_token(token)}").execute().data

    output=llm(token,
    f"""
    You are helping to format a user's GitHub projects so that it can be inserted into their resume.

    Here is the job listing:
    
    {job_listing}

    Here are some potentially relevant projects that the user has selected for inclusion in their resume:

    {"\n\n".join([project["text"] for project in projects])}

    Summarize the list of projects into a list of projects that can be inserted into the resume. You are free to remove any project from the list if they are not in fact relevant.

    It is imperative that you ONLY return a bullet point list, nothing else.
    """
    )


@endpoint("/generate/latex", ["input", "resume_id"], ["output", "filename"])
def latex():
    #The user should be asked if they want to recreate/edit the returned latex code
    #llm should strip first

    resume=User.table("user_to_resume").select("filename, content").and_(f"id.eq.{resume_id}, uid.eq.{get_uid_from_token(token)}").execute().data[0]

    output=llm(token,
    f"""
You are editing the resume of a user to include some of their personal GitHub projects.

    Here is the LaTeX resume they want to edit:

    {resume["content"]}

    Here is the bullet point list they want to include:

    {input}

    Integrate the bullet point list into the resume in a way that maintains the cohesion of the resume's theme, style, and structure --- do not just paste in the list without any consideration.

    Return JUST the modified resume, nothing more.
    """)

    filename=resume["filename"]

@endpoint("/endpoint/pdf", ["filename", "content"], [File("output")])
def pdf():
    filename+=".tex"
    response=requests.get(config["LATEX_COMPILER_URL"], params={"filename": filename, "content": content}).json() #The file on the lambda is saved as filename

    if response["statusCode"]!=200:
        raise ValueError(response["headers"]["Error-Message"])
    else:
        body=response["body"]
        if response["isBase64Encoded"]:
            body=base64.b64decode(body)

        output=io.BytesIO(body)
        output.name=filename



    

