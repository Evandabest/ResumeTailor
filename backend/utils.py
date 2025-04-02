from supabase import *
from flask import Flask, request, url_for
import pathlib, sys, types, traceback, functools
import dotenv, jwt, requests, sqlalchemy as sql
import os

#Move the backend/... directories to the end of sys.path to deal with path conflicts (Python should really just make relative import based purely on location, not on sys.path)
backend_directory=pathlib.Path(__file__).parent
backend_directories=[backend_directory, backend_directory / 'tests']
sys.path[:]=(x for x in sys.path if pathlib.Path(x) not in backend_directories)
sys.path.extend(list(map(str, backend_directories)))

app = Flask(__name__)

# Load .env file if it exists
dotenv.load_dotenv()

# Create config dict that prioritizes environment variables over .env file
config = {
    "NEXT_GITHUB_CLIENT_ID": os.environ.get("NEXT_GITHUB_CLIENT_ID"),
    "NEXT_GITHUB_CLIENT_SECRET": os.environ.get("NEXT_GITHUB_CLIENT_SECRET"),
    "SUPABASE_URL": os.environ.get("SUPABASE_URL"),
    "SUPABASE_USER_KEY": os.environ.get("SUPABASE_USER_KEY"),
    "SUPABASE_ADMIN_KEY": os.environ.get("SUPABASE_ADMIN_KEY"),
    "SUPABASE_JWT_SECRET": os.environ.get("SUPABASE_JWT_SECRET"),
    "SUPABASE_PSQL_USER": os.environ.get("SUPABASE_PSQL_USER"),
    "SUPABASE_PSQL_PASSWORD": os.environ.get("SUPABASE_PSQL_PASSWORD"),
    "SUPABASE_PSQL_HOST": os.environ.get("SUPABASE_PSQL_HOST"),
    "SUPABASE_PSQL_PORT": os.environ.get("SUPABASE_PSQL_PORT"),
    "SUPABASE_PSQL_DBNAME": os.environ.get("SUPABASE_PSQL_DBNAME")
}

# Fall back to .env file values if environment variables not set
env_values = dotenv.dotenv_values()
for key in config:
    if config[key] is None and key in env_values:
        config[key] = env_values[key]

# Validate required configuration
missing_keys = [key for key in config if config[key] is None]
if missing_keys:
    raise ValueError(f"Missing required configuration: {', '.join(missing_keys)}")


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
    Injects the keys specified in `arguments` from the request JSON as local variables in the decorated function. The inclusion of `token` is implied.

    Returns all of the locals whose names was specified by `results` in a single response JSON. The inclusion of both `error` and `message` are implied.

    This forces better self-documentation by not allowing the caller to use or return variables without specifying them ahead of time
    """

    def decorator(f):
        @app.route(endpoint, methods=["POST"])
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            parameters_=parameters.copy()

            parameters_.append("token")
            parameters_ = { k: request.json.get(k, None) for k in parameters_}
            
            if outputs is None:
                outputs_=[]
            else:
                outputs_=outputs.copy()
            outputs_.extend(["error", "message"])
            persistent_locals=PersistentLocals(f, parameters_)
            try:
                token=parameters_["token"]

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

            return {k: persistent_locals.locals[k] for k in outputs_ if k in persistent_locals.locals}, status_code
            
        return wrapper
    return decorator


def get_id_from_token(token):
    return User.auth.get_user(token).user.id
