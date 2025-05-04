# ResumeTailor Backend

## Overview

Backend service for ResumeTailor providing user management, GitHub integration, and LaTeX resume management. Built with Flask and Supabase.

## Features

- User authentication and session management
- GitHub repository integration with semantic search
- Resume upload and management (.tex files)
- Project analysis and embedding using Google's Gemini API
- PostgreSQL database integration via Supabase

## Setup

### Prerequisites

1. Python 3.11
2. PDM package manager (`pip install pdm`)
3. Supabase account
4. Google Gemini API key
5. GitHub API token (for development)

### Installation

```bash
cd backend
pip install pdm
pdm config python.use_venv False
pdm install
```

### Environment Configuration

Create `.env` with:
```
# Supabase Configuration
SUPABASE_URL=
SUPABASE_USER_KEY=
SUPABASE_ADMIN_KEY=
SUPABASE_JWT_SECRET=

# Database Configuration
SUPABASE_PSQL_USER=
SUPABASE_PSQL_PASSWORD=
SUPABASE_PSQL_HOST=
SUPABASE_PSQL_PORT=
SUPABASE_PSQL_DBNAME=

# Test Configuration
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
TEST_USER_GITHUB_TOKEN=
TEST_USER_GEMINI_TOKEN=
```

## API Endpoints

### Authentication (`users.py`)
- `POST /signup`: Register new user
  - Params: `email`, `password`
- `POST /login`: User login
  - Params: `email`, `password`
  - Returns: `token`, `refresh_token`
- `POST /refresh`: Refresh authentication token
  - Params: `refresh_token`
  - Returns: `token`, `refresh_token`
- `POST /modify`: Update user details
  - Params: Optional `email`, `password`
  - Returns: Updated `email` if changed
- `POST /logout`: Sign out user
  - Params: `token`, Optional `scope` ("local"/"global")
- `POST /delete`: Delete user account
  - Requires valid token

### GitHub Integration (`github.py`)
- `POST /user_to_token/update`: Link GitHub account
  - Params: `value`, `column`
- `POST /github/projects/list`: List GitHub repositories
  - Params: Optional `min_stars`, `is_archived`, `include[]`, `exclude[]`, `only[]`
  - Returns: List of repos with URLs
- `POST /github/projects/import`: Import selected projects
  - Params: `repos[]` (list of repo names)
  - Generates embeddings using Gemini API
- `POST /github/selection/set`: Store project selection
  - Params: `data` (selection state)
- `GET /github/selection/get`: Retrieve project selection
  - Returns: Selected projects data

### Resume Management (`resume.py`)
- `POST /resume/upload`: Upload LaTeX resume
  - Params: `file` (.tex), Optional `update` (ID)
  - Max file size: 5MB
- `POST /resume/delete`: Delete resume
  - Params: `id`
- `POST /resume/list`: List user's resumes
  - Returns: List of resumes with IDs and filenames
- `POST /resume/rename`: Rename resume
  - Params: `id`, `name` (must end in .tex)

## Development

### Running the Server

```bash
# Development with debug
pdm run flask run --debug

# Production mode
pdm run flask run
```

### Testing

```bash
# Run all tests with coverage
pdm run pytest

# Run without coverage
pdm run pytest --no-cov
```

## Contributing

1. Check issues and create feature branch
2. Add tests for new functionality
3. Ensure all tests pass: `pdm run pytest`
4. Update documentation if needed
5. Submit pull request
