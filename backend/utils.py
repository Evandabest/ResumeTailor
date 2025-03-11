from supabase import *
from flask import Flask, request, url_for
import sys, types, traceback, functools
import dotenv, jwt, requests

app = Flask(__name__)

config=dotenv.dotenv_values()

User = create_client(config["SUPABASE_URL"], config["SUPABASE_USER_KEY"])

Admin = create_client(config["SUPABASE_URL"], config["SUPABASE_ADMIN_KEY"])

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
            if event=='return': #TODO: Make sure that this also fires when an exceptions bubbles up
                if(frame.f_code==self.func.__code__):
                    self._locals = frame.f_locals.copy()

            elif event=="call":
                if(frame.f_code==self.func.__code__):
                    frame.f_locals.update(self.locals_dict)
                    frame.f_globals.update(self.locals_dict)
                    
        # tracer is activated on next call, return or exception
        sys.setprofile(tracer)
        try:
            # trace the function call
            
            res=self.func(*args, **kwargs)
        finally:
            # disable tracer and replace with old one
            sys.setprofile(None)
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
                        session_id=jwt.decode(token, config["SUPABASE_JWT_SECRET"], algorithms=["HS256"], options={"verify_signature": False})["session_id"]
                        session_count=len(Admin.table("auth.sessions").select("id").eq("id", session_id).execute()["data"])

                        if session_count==0:
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
