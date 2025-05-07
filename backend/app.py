from .users import *
from .github import *
from .resume import *
#app.run(port=6000, debug=True, use_reloader=True)


from utils import extract_keywords, endpoint

@endpoint("/extract-keywords", parameters=["resume_text"], outputs=["matched_keywords"])
def extract_keywords_endpoint(resume_text, token):
    matched_keywords = extract_keywords(
        resume_text,
        ["python", "sql", "flask", "aws", "javascript"]
    )
    return locals()
