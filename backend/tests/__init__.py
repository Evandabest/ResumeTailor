"""
This acts as the "utils.py" for test.py, as I don't want to clutter up the "tests" directory with a non-test "utils.py"
"""

import io, json, sys, functools, ast, collections, inspect, pathlib
from multipart import parse_options_header, MultipartParser
import pytest

from ..app import *

@functools.cache
def get_all_asserts(filename):
    root=ast.parse(open(filename).read())
    asserts={}

    class AssertionFinder(ast.NodeVisitor):
            def generic_visit(self, node):
                if isinstance(node, ast.Assert):
                    asserts[node.lineno]=(ast.unparse(node.test), node.end_lineno)
                super().generic_visit(node)
    AssertionFinder().visit(root)

    return asserts

def ignore_asserts(f): #None of this would be needed if Python just supported (syntactic) macros like everyone else
    def wrapper(*args, **kwargs):
        """
        This function will only work if an assert statement is not on the same line as another statement, nor is in a string (both of which should be true)
        """

        
        def trace_function(frame, event, arg):
            #print(inspect.getsource(sys.modules[__name__]))
            filename=frame.f_code.co_filename

            if pathlib.Path(__file__).resolve().parents[0] not in pathlib.Path(filename).parents: #Determine if file is in "tests" directory
                return

            asserts=get_all_asserts(filename)
        
            if event=="line":
                info = asserts.get(frame.f_lineno, None)
                if info is not None:
                    exec(info[0], frame.f_globals, frame.f_locals)
                    frame.f_lineno=info[1]+1
            elif event=="call":
                return trace_function
        
        # Set the trace function
        old_trace = sys.gettrace()
        sys.settrace(trace_function)
        
        try:
            # Call the function
            result=f(*args, **kwargs)
        finally:
            # Restore the previous trace function
            sys.settrace(old_trace)
        
        return result
    return wrapper

@pytest.fixture(scope="module")
def client(request):
    mod=request.module
    app.config.update({"TESTING": True})

    with app.test_client() as client:
        setup=getattr(mod, "setup", None)
        if setup is not None:
            setup(client)

        yield client

        teardown=getattr(mod, "teardown", None)
        if teardown is not None:
            teardown(client)

def decode_form(response):
    class DecodedForm(dict):
        def __init__(self, response):
            super().__init__()
            self.files={}
            content_type, options = parse_options_header(response.content_type)

            if content_type=="multipart/form-data":
                for part in MultipartParser(io.BytesIO(response.get_data()), options["boundary"], spool_limit=10e6, memory_limit=20e6):
                    if part.filename:
                        part.file.name=part.filename
                        self.files[part.name]=part.file
                    elif part.name=="json":
                        super().update(json.loads(part.value))
            else:
                if response.json is not None:
                    super().update(response.json)
    
    return DecodedForm(response)

def is_error(response, error_code=500):
    
    assert (response.status_code == error_code)

    if error_code!=500:
        return
    
    form=decode_form(response)
    
    assert form

        #We don't check that the error is from gotrue, as we may want to add our own custom errors later
    for key in ["error", "message"]:
        assert form.get(key, "") != ""
        pass


def is_success(response):  #Similar to Rust's unwrap

    assert response.status_code == 200

    form=decode_form(response)

    assert form

    for key in ["error", "message"]:
        assert form.get(key, "") == ""

    return form

