from .utils import *

@endpoint("/github/link", [], outputs=["url"])
def link():
    User.auth.set_session(token, "None") #Works as long as the token doesn't expire by the time we run link_identity
    response=User.auth.link_identity({"provider": "github", "scopes":"repo"})
    url=response.url
