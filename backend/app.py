from users import *
from github import *
from resume import *
from flask import Flask
from utils import *
#app.run(port=6000, debug=True, use_reloader=True)
app = Flask(__name__)

if __name__ == '__main__':
    app.run(debug=True)