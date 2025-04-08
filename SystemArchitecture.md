# ResumeTailor Architecture

## High-Level Component Diagram

![High-Level Component Diagram](static/high_level_component_diagram.png)

ResumeTailor follows a modern web application architecture with three distinct layers. At the frontend, a Next.js web client serves as the user interface, handling all user interactions and making HTTPS/JSON API calls to the backend. The middle layer consists of a Flask web server that acts as the central coordinator, processing incoming requests and managing communication with external services. This server interacts with three key external services: GitHub for repository data (via PyGithub making REST calls), Supabase for authentication (using supabase-py over TCP), and a PostgreSQL database for data persistence (accessed through SQLAlchemy over TCP). When users interact with the frontend, requests flow through the Flask server, which orchestrates the necessary calls to GitHub for repository information, Supabase for user authentication, and PostgreSQL for data storage and retrieval. This layered approach ensures clean separation of concerns while maintaining efficient communication pathways between components.

## Entity-Relationship Diagram

![Entity-Relationship Diagram](static/entity_relationship_diagram.png)

The database architecture of ResumeTailor consists of interconnected tables managed by both Supabase authentication and custom public schemas. The core auth_users table maintains user identities with unique UUIDs, email addresses, and encrypted passwords. This table forms relationships with several other entities: it maintains multiple sessions through auth_sessions, tracks multiple GitHub projects via public_user_to_project (storing project details including name, readme, stars, and arrays of topics and languages), manages multiple resumes through public_user_to_resume (containing filename and content), and holds exactly one GitHub authentication token in public_user_to_token. The schema uses UUID foreign keys to maintain referential integrity, with instance_id serving as auto-incrementing primary keys in the project and resume tables. Notably, all project and resume data is linked back to users through their UUID, creating a well-organized hierarchical structure that supports the application's core features of GitHub integration and resume management.

## Call Sequence Diagram

![Call Sequence Diagram](static/call_sequence_diagram.png)

The above diagram showcases the "Compile LaTeX Resume" feature. The LaTeX compilation process in ResumeTailor begins when a user modifies LaTeX code in the Monaco Editor, which triggers a handleEditorChange event in the EditResumePage component. When the user clicks the "Compile" button, the frontend sets a loading state and sends a POST request with the LaTeX content to the Flask backend server. The backend forwards this content to a Docker container that handles the LaTeX compilation, converting the code into a PDF. Once compiled, the Docker container returns the PDF data to the backend, which then converts it to base64 format and sends it back to the frontend. The frontend updates its state with the new PDF data, clears the loading state, and finally displays the compiled PDF in an iframe within the browser, completing the compilation flow from raw LaTeX code to rendered PDF document.