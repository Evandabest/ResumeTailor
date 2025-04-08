# Resume Tailor Architecture

## Component Diagram
![Component Diagram](/assets/component.png)

This the component diagram of the Resume Tailor application. The client-facing product is built using Next.js and interacts with the Flask server via JSON requests. The Flask server handles various operations including accessing GitHub through the Python GitHub client, managing data with the Python Supabase client, and interacting with PostgreSQL through SQLAlchemy. Docker is used to containerize the LaTeX compilation process. Supabase acts as both the database and authentication provider, storing user data and resumes.

## Entity Diagram
![Entity Diagram](/assets/er.png)

The entity diagram represents the data schema used in the Resume Tailor application. The primary entities include `auth_users`, `auth_sessions`, `public_user_to_project`, `public_user_to_token`, and `public_user_to_resume`. The `auth_users` stores all the information about the user, their email, passwords (encrypted) and other information like how the user logged in (email & pass or github). An entry in this table is created when the user signs up. When the user signs up a JWT is generated and it is stored in the browser cookies and in the `auth_sessions` along with the user's UUID. The user_to_token table stores the github token assoicated with the user. The user can connect their account to github to import their projects. The projects are stored on the `user_to_project` table. This table will store each user's project details. These details include the stars, description, topics, readme, languages, and url. All of this information will be used to implement a RAG querying system for the projects in a later iteration. Lastly `user_to_resume` will store resumes created by the user and its content. All of these tables share an instance id, originally the UUID created when making the account to keep track of ownership


## Call Sequence Diagram
![Call Sequence Diagram](/assets/sequence.png)

The call sequence diagram demonstrates the workflow of generating a tailored resume. The browser client sends a POST request to the Flask server containing resume data, template, and projects. The resume data will usually be an exisiting resume or in the case that the user starts from scratch, it will not contain anything. The server then calls the OpenAI API to generate LaTeX content based off the resume data, provided template and relevant projects. After getting the new Resume from the API response, the LaTex code is then sent to the Docker image to get compiled as a viewable pdf. After getting this pdf from the Docker image, it is then sent back to the frontend to be viewed by the client.




