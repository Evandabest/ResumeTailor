from supabase import *
from flask import Flask, request
import dotenv
import functools
import sys, types

app = Flask(__name__)

config=dotenv.dotenv_values()

client = create_client(config["SUPABASE_URL"], config["SUPABASE_KEY"])

class PersistentLocals(object):
    def __init__(self, func, locals_dict):
        self._locals = {}
        self.func = func
        self.locals_dict=locals_dict

    def __call__(self, *args, **kwargs): #https://code.activestate.com/recipes/577283-decorator-to-expose-local-variables-of-a-function-/
        def tracer(frame, event, arg):
            if event=='return':
                self._locals = frame.f_locals.copy()

            elif event=="call":
                if(frame.f_code==self.func.__code__):
                    frame.f_locals.update(self.locals_dict)

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

def endpoint(endpoint, arguments, results=None):
    """
    Injects the keys specified in `arguments` from the request JSON as local variables in the decorated function. The inclusion of `token` is implied.

    Returns all of the locals whose names was specified by `results` in a single response JSON. The inclusion of `error` is implied.

    This forces better self-documentation by not allowing the caller to use or return variables without specifying them ahead of time
    """

    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            nonlocal results
            
            arguments.append("token")
            arguments = { k: request.json.get(k, None) for k in arguments}
            if results is None:
                results=[]
            results.append("error")
            persistent_locals=PersistentLocals(f, arguments)
            app.route(endpoint)(persistent_locals)(*args, **kwargs)

            return {k: persistent_locals.locals[k] for k in results if k in persistent_locals}
            
        return wrapper
    return decorator
