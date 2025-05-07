import pytest
from utils import app  # If `app` is defined elsewhere, import it from there

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_extract_keywords_route(client):
    response = client.post("/extract-keywords", json={
        "resume_text": "Worked with Python and AWS",
        "token": None
    })
    assert response.status_code == 200
    assert "python" in response.json["matched_keywords"]
    assert "aws" in response.json["matched_keywords"]

def test_extract_keywords_missing_param(client):
    response = client.post("/extract-keywords", json={"token": None})
    assert response.status_code == 200
    assert response.json["error"] != ""
