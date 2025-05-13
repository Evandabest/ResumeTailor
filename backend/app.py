from flask import Flask
from users import *
from github import *
from resume import *
from utils import *

app = Flask(__name__)

# Your routes and other configurations will be imported from the other modules

# This is required for Vercel
if __name__ == '__main__':
    app.run(debug=True)

@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}
