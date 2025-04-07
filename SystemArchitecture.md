# Resume Tailor Architecture

## Component Diagram
![Component Diagram](/assets/component.png)

This the component diagram of the Resume Tailor application. The client-facing product is built using Next.js and interacts with the Flask server via JSON requests. The Flask server handles various operations including accessing GitHub through the Python GitHub client, managing data with the Python Supabase client, and interacting with PostgreSQL through SQLAlchemy. Docker is used to containerize the LaTeX compilation process. Supabase acts as both the database and authentication provider, storing user data and resumes.

