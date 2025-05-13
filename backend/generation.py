from .utils import *
import io, base64

@endpoint("/generate/rag", ["job_listing"], ["repos"])
def rag():
    #By default, all of the returned repos should be marked as "checked" on the frontend --- the user can uncheck any of the projects they feel do not match

    ids=User.rpc("match_projects", {"uid": get_uid_from_token(token), "query_embedding": get_embeddings(token, [job_listing])[0], "minimum_score": (0 if app.testing else 0.5), "count": 10}).execute().data #Can tweak the minimum and/or count

    repos=User.table("user_to_project").select("id, name, url").in_("id", ids).execute().data

@endpoint("/generate/points", ["ids", "job_listing"], ["output"])
def points():
    #The user should be asked if they want to recreate the points, as well as edit the points manually if needed

    projects=User.table("user_to_project").select("text").in_("id", ids).eq("uid", get_uid_from_token(token)).execute().data

    
    if len(projects)==0: #Raise an error when there's nothing that is returned
        raise ValueError("No projects available to use in generation!")

    project_separator="\n\n"
    output=llm(token,
    f"""
    You are helping to format a user's GitHub projects so that it can be inserted into their resume.

    Here is the job listing:
    
    {job_listing}

    Here are some potentially relevant projects that the user has selected for inclusion in their resume:

    {project_separator.join([project["text"] for project in projects])}

    Summarize the list of projects into a list of projects that can be inserted into the resume. You are free to remove any project from the list if they are not in fact relevant.

    It is imperative that you ONLY return a bullet point list, nothing else.
    """
    )


@endpoint("/generate/latex", ["input", "resume_id"], ["output", "filename"])
def latex():
    #The user should be asked if they want to recreate/edit the returned latex code
    #llm should strip first

    resume=User.table("user_to_resume").select("filename, content").eq("id", resume_id).eq("uid", get_uid_from_token(token)).execute().data[0]

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

    output=output.strip("```latex").rstrip("```")

    filename=resume["filename"]

@endpoint("/generate/pdf", ["filename", "content"], [File("file")])
def pdf():
    response=requests.post(config["LATEX_COMPILER_URL"], json={"filename": filename+".tex", "content": content}).json()

    if (response["statusCode"]!=200) and (not app.testing): #We'll disable error checking for now. We'll re-enable it once we get Gemini to produce valid LaTeX.
        raise ValueError(response["headers"]["Error-Message"])
    else:
        body=response["body"]
        if response["isBase64Encoded"]:
            body=base64.b64decode(body)

        file=io.BytesIO(body)
        
        file.name=filename+".pdf"



    

