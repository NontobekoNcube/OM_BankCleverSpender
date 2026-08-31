from flask import Flask
from db import create_tables

app = Flask(__name__)
create_tables()

@app.route('/')
def home():
    return {"message": "CleverSpender API is running!"}

if __name__ == '__main__':
    app.run(debug=True)