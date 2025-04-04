from .utils import *
from werkzeug.utils import secure_filename
import os

table=User.table("user_to_resume")

@endpoint("/resume/upload", [File("file"), "update"])
def upload():
    filename= secure_filename(file.filename)

    if not filename.endswith(".tex"):
        raise ValueError("Only .tex files can be uploaded")

    data={"id": get_id_from_token(token), "text": file.read().decode(), "filename": filename}

    if update is None:
        action=table.insert(data)
    else:
        action=table.upsert(data | {"instance_id": update})
    action.execute()

@endpoint("/resume/delete", ["id"])
def delete():
    table.delete().eq("id", id).execute()

@endpoint("/resume/list", [], ["data"])
def list():
    data=table.select("id:instance_id, filename").execute().data

@endpoint("/resume/rename", ["id", "name"])
def rename():
    if not filename.endswith(".tex"):
        raise ValueError("New name must end in '.tex'")

    table.update({"filename": name}).eq("instance_id", id).execute()
    
    
