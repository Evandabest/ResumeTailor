"""
This acts as the "utils.py" for test.py, as I don't want to clutter up the "tests" directory with a non-test "utils.py"
"""

import sys, functools, ast, collections, inspect, pathlib
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
def client():

    app.config.update({"TESTING": True})

    with app.test_client() as client:
        setup=inspect.currentframe().f_back.f_globals.get("setup")
        if setup is not None:
            setup(client)
        yield client

        teardown=inspect.currentframe().f_back.f_globals.get("teardown")
        if teardown is not None:
            teardown(client)
