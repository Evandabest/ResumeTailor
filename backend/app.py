from .users import *
from .github import *
from .resume import *
#app.run(port=6000, debug=True, use_reloader=True)

"""
The text in each row of user_to_project will be combined to create a single column. Each project will be "<column_name>: <str(value)>" concatenated into a single string. Use gemini embeddings (https://ai.google.dev/gemini-api/docs/embeddings), and follow this: https://supabase.com/docs/guides/ai/semantic-search#semantic-search-in-postgres (try gte-small as well). Vectors are stored alongside the content
"""
