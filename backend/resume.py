from .utils import *
import os
import inspect
from pathlib import Path

table=User.table("user_to_resume")
#Validate id by checking the "id" column matches the uid in the token (ie, validate_id(id, token)). Write tests that test this by using invalid ids (ie, either negative or outside the range returned by list)

def validate_id(id): #Checks whether the resume referenced by the id has permission to be accessed by the user in the token
    token=inspect.currentframe().f_back.f_locals["token"]
    data=table.select("uid").eq("id", id).execute().data
    if ((len(data)==0) or (data[0]["uid"]!=get_uid_from_token(token))):
        raise ValueError("Current user does not have permission to access the resume at the given id")

@endpoint("/resume/upload", [File("file"), "update"])
def upload():
    filename= Path(file.filename).stem

    if not filename.name.endswith(".tex"):
        raise ValueError("Only .tex files can be uploaded")

    data={"uid": get_uid_from_token(token), "content": file.read().decode(), "filename": filename}

    if update is None:
        action=table.insert(data)
    else:
        validate_id(update)
        action=table.update(data).eq("id", update)
    action.execute()

@endpoint("/resume/delete", ["id"])
def delete():
    validate_id(id)
    table.delete().eq("id", id).execute()

@endpoint("/resume/list", [], ["info"])
def list():
    data=table.select("id, filename").execute().data

@endpoint("/resume/rename", ["id", "name"])
def rename():
    if not name.endswith(".tex"):
        raise ValueError("New name must end in '.tex'")

    validate_id(id)
    table.update({"filename": Path(name).stem}).eq("id", id).execute()
    
    
