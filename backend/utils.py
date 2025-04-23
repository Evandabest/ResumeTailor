from supabase import *
from flask import Flask, request, url_for, Response
import pathlib, sys, types, traceback, functools, json
import dotenv, jwt, requests, sqlalchemy as sql
from requests_toolbelt import MultipartEncoder

import google
from google.genai.types import EmbedContentConfig

#Move the backend/... directories to the end of sys.path to deal with path conflicts (Python should really just make relative import based purely on location, not on sys.path)
backend_directory=pathlib.Path(__file__).parent
backend_directories=[backend_directory, backend_directory / 'tests']
sys.path[:]=(x for x in sys.path if pathlib.Path(x) not in backend_directories)
sys.path.extend(list(map(str, backend_directories)))

app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 5 * 1000 * 1000 #Uploaded files must be at most 5 MB

config=dotenv.dotenv_values()

User = create_client(config["SUPABASE_URL"], config["SUPABASE_USER_KEY"])
Admin = create_client(config["SUPABASE_URL"], config["SUPABASE_ADMIN_KEY"])

engine=sql.create_engine(sql.URL.create(
"postgresql+psycopg2",
username=config["SUPABASE_PSQL_USER"],
password=config["SUPABASE_PSQL_PASSWORD"],
host=config["SUPABASE_PSQL_HOST"],
port=int(config["SUPABASE_PSQL_PORT"]),
database=config["SUPABASE_PSQL_DBNAME"],
query={"sslmode": "disable"}
))

class Special: #Class for special arguments
    def __init__(self, arg):
        self.val=arg
    def __str__(self):
        return str(self.val)

class File(Special):
    pass

class StaleTokenError(Exception):
    def __str__(self):
        return "This token has expired. Please /login or /refresh to get a new one."

class PersistentLocals(object):
    def __init__(self, func, locals_dict):
        self._locals = {}
        self.func = func
        self.locals_dict=locals_dict

    def __call__(self, *args, **kwargs): #https://code.activestate.com/recipes/577283-decorator-to-expose-local-variables-of-a-function-/
        def tracer(frame, event, arg):
            frame.f_trace_lines=False
            frame.f_trace_opcodes=False

            if (frame.f_code==self.func.__code__):
                if event=='return':
                    self._locals = frame.f_locals.copy()
                elif event=='call':
                    frame.f_locals.update(self.locals_dict)
                    frame.f_globals.update(self.locals_dict)

                    return tracer
            else:
                frame.f_trace=old_trace
                    
        old_trace=sys.gettrace()
        sys.settrace(tracer)
        try:
            # trace the function call
            res=self.func(*args, **kwargs)
        finally:
            # disable tracer and replace with old one
            sys.settrace(old_trace)
        return res

    def clear_locals(self):
        self._locals = {}

    @property
    def locals(self):
        return self._locals

def endpoint(endpoint, parameters, outputs=None):
    """
    Injects the keys specified in `parameters` from the request JSON as local variables in the decorated function. The inclusion of `token` is implied.

    Returns all of the locals whose names was specified by `outputs` in a single response JSON. The inclusion of both `error` and `message` are implied.

    This forces better self-documentation by not allowing the caller to use or return variables without specifying them ahead of time
    """

    def decorator(f):
        
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            parameters_=parameters.copy()

            parameters_.append("token")

            special_params={k: k.__class__ for k in parameters_ if not isinstance(k, str)}

            parameters_map={} #Mapping parameters to their values 
            
            if request.is_json:
                json_=request.json.copy()
            else:
                json_={}
            
            json_|=json.loads(request.form.get("json", "{}"))
            for parameter in parameters_:
                cls=parameter.__class__
                parameter=str(parameter)
                if cls==File:
                    val=request.files.get(parameter, None)
                else:
                    val=json_.get(parameter, None)
                
                parameters_map[parameter]=val
            
            if outputs is None:
                outputs_=[]
            else:
                outputs_=outputs.copy()
            outputs_.extend(["error", "message"])
            persistent_locals=PersistentLocals(f, parameters_map)
            try:
                token=parameters_map["token"]

                if (token is not None):  #https://supabase.com/docs/guides/auth/sessions#how-to-ensure-an-access-token-jwt-cannot-be-used-after-a-user-signs-out
                    try:
                        User.auth.get_user(token)
                    except:
                        raise StaleTokenError
                    else:
                        session_id=jwt.decode(token, config["SUPABASE_JWT_SECRET"], algorithms=["HS256"], options={"verify_signature": True, "verify_aud":False, "verify_iss":False, "verify_exp": False, "verify_iat": False, "verify_nbf": False})["session_id"]

                        with engine.connect() as connection:
                            if connection.execute(sql.text("SELECT id FROM auth.sessions WHERE id = :id LIMIT 1"), {"id": session_id}).first() is None:
                                raise StaleTokenError

                persistent_locals(*args, **kwargs)
            except Exception as e:
                persistent_locals.locals["error"]=e.__class__.__name__
                persistent_locals.locals["message"]=str(e)

                persistent_locals.locals["status_code"]=500

                if app.testing:
                    print(traceback.format_exc())

            status_code=persistent_locals.locals.get("status_code", 200)

            for key in ["error", "message"]:
                if key not in persistent_locals.locals:
                    persistent_locals.locals[key]=""
            
            json_outputs={}
            file_outputs={}

            for k in outputs_:
                if k not in persistent_locals.locals:
                    continue
                val=persistent_locals.locals[k]
                cls=k.__class__
                k=str(k)
                if cls==File:
                    file_outputs[k]=(k, val.read())
                elif cls==str:
                    json_outputs[k]=val
            if len(file_outputs)>0:
                m=MultipartEncoder(fields={"json": json.dumps(json_parts)}|file_outputs)

                return Response(m.to_string(), mimetype=m.content_type, status=status_code)
            else:
                return json_outputs, status_code
        
        wrapper.__name__=(f.__module__+"."+f.__name__).replace(".", "_")
        wrapper=app.route(endpoint, methods=["POST"])(wrapper)
        #@app.route(endpoint, methods=["POST"])
        return wrapper
    return decorator

def get_uid_from_token(token):
    return User.auth.get_user(token).user.id

user_to_token_table=User.table("user_to_token")

def retrieve(token, column):
    lst=user_to_token_table.select(column).eq("id", get_id_from_token(token)).execute().data
    if len(lst)==0:
        return None
    else:
        return lst[0][column]
        
def get_gemini_client(token):
    _token=retrieve(token, "gemini")
    if not _token:
        _token=config["TEST_USER_GEMINI_TOKEN"]

    return google.genai.Client(api_key=_token)

def get_embeddings(token, data):
    embeddings=get_gemini_client(token).models.embed_content(
        model="text-embedding-004",
        contents=data, 
        config=EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
    ).embeddings

    return [x.values for x in embeddings]

def llm(token, content):
    content=content.strip()
    
    return get_gemini_client(token).models.generate_content(
        model="gemini-2.5-flash-preview-04-17",
        contents=content
        ).text


