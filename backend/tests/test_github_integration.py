import pytest
from unittest.mock import patch
from ..app import app, Admin, User
from ..github_auth import GitHubAuthError
import os

@pytest.fixture
def client():
    """Create a test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def cleanup_user():
    """Fixture to ensure user cleanup after tests"""
    tokens_to_cleanup = []
    
    def _store_token(token):
        tokens_to_cleanup.append(token)
    
    yield _store_token
    
    # Clean up all users after test
    with app.test_client() as client:
        for token in tokens_to_cleanup:
            try:
                # Delete user which cascades to profile and GitHub projects
                client.post("/delete", json={"token": token})
            except Exception as e:
                print(f"Error during cleanup: {e}")

def test_github_projects_database_integration(client, cleanup_user):
    """
    Integration test demonstrating successful interaction between:
    1. User authentication system
    2. Database operations for GitHub projects
    3. Project data caching and retrieval
    
    Tests the integration between auth system and database without requiring GitHub OAuth.
    """
    # Set up test user
    test_email = "integration_test@example.com"
    test_password = "test123!"
    
    # Create test user and get auth token
    signup_resp = client.post("/signup", json={
        "email": test_email,
        "password": test_password
    })
    assert signup_resp.status_code == 200
    assert signup_resp.json["error"] == ""
    
    login_resp = client.post("/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_resp.status_code == 200
    auth_token = login_resp.json["token"]
    user = User.auth.get_user(auth_token).user
    
    # Store auth token for cleanup
    cleanup_user(auth_token)
    
    try:
        # Simulate GitHub data being stored by directly inserting test data
        test_projects = [
            {
                "user_id": user.id,
                "repo_id": 123,
                "name": "test-repo",
                "description": "Test repository",
                "languages": {"Python": 1000},
                "readme": "# Test Repo",
                "html_url": "https://github.com/test/repo",
                "updated_at": "2024-03-16T12:00:00Z"
            }
        ]
        
        # Test the integration between auth and project storage/retrieval
        # First, verify no projects exist yet
        initial_projects = Admin.table("github_projects").select("*").eq("user_id", user.id).execute()
        assert len(initial_projects.data) == 0

        # Insert test project directly - simulating cached GitHub data
        Admin.table("github_projects").insert(test_projects[0]).execute()
        
        # Now test fetching projects - should return from database
        projects_resp = client.post("/github/projects", json={
            "token": auth_token
        })
        
        # Test response
        assert projects_resp.status_code == 200
        response_data = projects_resp.json
        assert response_data["error"] == "", f"Unexpected error: {response_data.get('message', '')}"
        assert response_data["message"] == ""
        assert "projects" in response_data, f"Expected 'projects' in response, got: {response_data}"
        projects_list = response_data["projects"]
        
        # Verify we got our test project
        assert len(projects_list) == 1
        assert projects_list[0]["repo_id"] == test_projects[0]["repo_id"]
        assert projects_list[0]["name"] == test_projects[0]["name"]
        
        # Verify data is properly cached
        cached_projects = Admin.table("github_projects").select("*").eq("user_id", user.id).execute()
        assert len(cached_projects.data) == 1
        assert cached_projects.data[0]["repo_id"] == test_projects[0]["repo_id"]
            
    except Exception as e:
        raise e

def test_auth_github_error_integration(client, cleanup_user):
    """
    Integration test demonstrating error handling between:
    1. User authentication system
    2. GitHub API failure
    3. Database fallback
    
    Tests how the system handles GitHub API failures while maintaining authentication
    and falling back to cached data.
    """
    # Set up test user
    test_email = "integration_error@example.com"
    test_password = "test123!"
    
    # Create and authenticate user
    signup_resp = client.post("/signup", json={
        "email": test_email,
        "password": test_password
    })
    assert signup_resp.status_code == 200
    assert signup_resp.json["error"] == ""
    
    login_resp = client.post("/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_resp.status_code == 200
    auth_token = login_resp.json["token"]
    
    # Store auth token for cleanup
    cleanup_user(auth_token)
    
    try:
        # Try to fetch GitHub projects without linking GitHub account
        projects_resp = client.post("/github/projects", json={
            "token": auth_token
        })
        
        # Should still return 200 but with empty projects list
        assert projects_resp.status_code == 200
        response_data = projects_resp.json
        assert response_data["error"] == ""
        assert response_data["message"] == ""
        assert response_data["projects"] == []
        
        # Now try to link with invalid GitHub code
        github_resp = client.post("/github/link", json={
            "token": auth_token,
            "code": "invalid_code"
        })
        
        # Should fail but not affect user's authentication
        assert github_resp.status_code == 500
        assert "No access token in GitHub response" in github_resp.json["message"]
        
        # Verify user is still authenticated
        user = User.auth.get_user(auth_token).user
        assert user is not None
        
        # Verify no GitHub data was cached
        profile = Admin.table("profiles").select("*").eq("id", user.id).execute()
        assert profile.data[0]["github_id"] is None
        assert profile.data[0]["github_access_token"] is None
        
    except Exception as e:
        raise e
