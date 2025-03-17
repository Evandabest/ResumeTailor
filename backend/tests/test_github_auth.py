import pytest
import uuid
import jwt
from unittest.mock import MagicMock
from ..github_auth import app, User, Admin, config

@pytest.fixture
def client():
    """Create a test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_token():
    """Create a valid auth token"""
    session_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    token = jwt.encode(
        {"session_id": session_id, "sub": user_id},
        config["SUPABASE_JWT_SECRET"],
        algorithm="HS256"
    )
    return token, session_id, user_id

@pytest.fixture
def mock_user(auth_token):
    """Mock authenticated user"""
    token, _, user_id = auth_token
    
    mock_user = MagicMock()
    mock_user.user = MagicMock()
    mock_user.user.id = user_id
    mock_user.session = MagicMock()
    mock_user.session.access_token = token
    return mock_user

@pytest.fixture
def mock_db_session(auth_token):
    """Mock database session verification"""
    _, session_id, _ = auth_token
    
    mock_connection = MagicMock()
    mock_result = MagicMock()
    mock_result.first.return_value = {"id": session_id}
    mock_connection.execute.return_value = mock_result
    
    return mock_connection

@pytest.fixture
def mock_github_api(monkeypatch):
    """Mock GitHub API responses"""
    # Default success responses
    github_token = "github_test_token"
    github_user_id = 12345
    github_username = "testuser"
    
    # Create mock responses
    mock_token_response = MagicMock()
    mock_token_response.status_code = 200
    mock_token_response.json.return_value = {"access_token": github_token}
    
    mock_user_response = MagicMock()
    mock_user_response.status_code = 200
    mock_user_response.json.return_value = {"id": github_user_id, "login": github_username}
    
    # Mock the requests module
    mock_post = MagicMock(return_value=mock_token_response)
    mock_get = MagicMock(return_value=mock_user_response)
    
    monkeypatch.setattr('requests.post', mock_post)
    monkeypatch.setattr('requests.get', mock_get)
    
    return {
        "post": mock_post, 
        "get": mock_get,
        "token_response": mock_token_response,
        "user_response": mock_user_response,
        "github_token": github_token,
        "github_user_id": github_user_id,
        "github_username": github_username
    }

@pytest.fixture
def mock_auth_and_db(monkeypatch, mock_user, mock_db_session):
    """Setup authentication and database mocks"""
    monkeypatch.setattr('backend.github_auth.User.auth.get_user', lambda token: mock_user)
    monkeypatch.setattr('sqlalchemy.engine.Engine.connect', lambda *args, **kwargs: mock_db_session)
    return mock_user

@pytest.fixture
def mock_profile_update(monkeypatch):
    """Mock profile update functionality"""
    mock_update = MagicMock()
    mock_profile_query = MagicMock()
    mock_profile_query.eq.return_value.execute.return_value = None
    mock_update.return_value = mock_profile_query
    
    mock_table = MagicMock()
    mock_table.return_value.update = mock_update
    
    monkeypatch.setattr(Admin, 'table', mock_table)
    
    return {
        "update": mock_update,
        "query": mock_profile_query,
        "table": mock_table
    }

def test_github_link_success(client, mock_auth_and_db, mock_github_api, mock_profile_update):
    """Test successful GitHub account linking"""
    mock_user = mock_auth_and_db
    
    # Test the endpoint
    response = client.post('/github/link', json={
        "token": mock_user.session.access_token,
        "code": "valid_oauth_code"
    })
    
    # Verify successful response
    assert response.status_code == 200
    result = response.json
    assert result["error"] == ""
    assert result["message"] == ""
    
    # Verify GitHub API was called correctly
    mock_github_api["post"].assert_called_once()
    mock_github_api["get"].assert_called_once()
    
    # Verify user profile was updated correctly
    mock_profile_update["update"].assert_called_once()
    update_data = mock_profile_update["update"].call_args[0][0]
    assert update_data["github_id"] == str(mock_github_api["github_user_id"])
    assert update_data["github_username"] == mock_github_api["github_username"]
    assert update_data["github_access_token"] == mock_github_api["github_token"]
    mock_profile_update["query"].eq.assert_called_once_with("id", mock_user.user.id)

def test_github_link_invalid_code(client, mock_auth_and_db, mock_github_api):
    """Test GitHub account linking with invalid OAuth code"""
    mock_user = mock_auth_and_db
    
    # Change the mock to return an error
    mock_github_api["token_response"].status_code = 400
    mock_github_api["token_response"].json.return_value = {
        "error": "bad_verification_code",
        "error_description": "The code passed is incorrect or expired."
    }
    mock_github_api["token_response"].text = "Error: bad_verification_code"
    
    # Test the endpoint
    response = client.post('/github/link', json={
        "token": mock_user.session.access_token,
        "code": "invalid_oauth_code"
    })
    
    # Verify error response
    assert response.status_code == 500
    result = response.json
    assert "Failed to get GitHub access token" in result["message"]
    
    # Verify API was called but no profile update
    mock_github_api["post"].assert_called_once()
    # Verify API was called but no profile update
    mock_github_api["post"].assert_called_once()
    mock_github_api["get"].assert_not_called()  # Check that the GET request was never made