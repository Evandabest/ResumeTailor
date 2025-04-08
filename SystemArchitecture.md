# Resume Tailor Architecture

---

## Component Diagram

![Component Diagram](./Component%20Dia.jpg)

This component diagram shows the architectural layout of the Resume Tailor application. The client-facing product is built using Next.js, which communicates with a Flask web server via JSON requests. 
The Flask server serves as the backend core, interfacing with GitHub through the PyGithub REST API to pull repository data. It also interacts with Supabase using the `supabase-py` client to manage user content and tokens. 
For persistent storage and queries, the application connects to a PostgreSQL database using SQLAlchemy over TCP. This setup enables modular communication between frontend, backend, database, and external services like GitHub, ensuring a scalable and maintainable system.

---

## Entity Relationship Diagram

![Entity Diagram](./Er%20Dia.jpg)

This entity relationship diagram outlines the database structure used by Resume Tailor. The `auth_users` table sits at the center of the schema, linking to user-specific resources.
`auth_sessions` connects via `user_id` to track active sessions. Other tables — `public_user_to_resume`, `public_user_to_token`, and `public_user_to_project` — connect through `instance_id`, 
allowing users to manage LaTeX resumes, API tokens, and GitHub projects. Foreign key relationships are clearly marked to ensure referential integrity across all interactions.

---

## Sequence Diagram
![Sequence Diagram](./Real%20Sequence%20Dia.jpg)

This sequence diagram illustrates the workflow for live LaTeX editing and PDF generation in the Resume Tailor application. A user modifies LaTeX code within the Monaco Editor, which triggers `handleEditorChange()` in the `EditResumePage` component. 
When the user clicks “Compile,” the component sets a loading state and sends a POST request to the Flask backend containing the LaTeX content. The Flask server forwards the data to a Dockerized LaTeX container, 
which compiles the LaTeX into a PDF and returns it as base64-encoded data. The client then decodes and displays the final compiled PDF in a viewer frame. This interaction ensures a seamless and responsive resume preview experience.
