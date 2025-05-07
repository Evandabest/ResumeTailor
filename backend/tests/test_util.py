from utils import extract_keywords

def test_extract_keywords_basic():
    resume = "Experienced in Python and SQL"
    keywords = ["python", "java", "sql"]
    result = extract_keywords(resume, keywords)
    assert set(result) == {"python", "sql"}

def test_extract_keywords_none_found():
    resume = "No relevant skills here"
    keywords = ["python", "sql"]
    result = extract_keywords(resume, keywords)
    assert result == []
