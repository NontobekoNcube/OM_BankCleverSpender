from flask import Flask, jsonify, request
from db import db
from user import User

app = Flask(__name__)

# tell SQLAlchemy where the database is
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cleverspender.db'

# connect SQLAlchemy to Flask
db.init_app(app) 
# create all tables from model classes
with app.app_context():
    db.create_all()


@app.route('/')
def home():
    return jsonify({"message": "CleverSpender API is running! "})

@app.route('/user/register', methods=['POST'])
def register_user():
    # get the JSON from the frontend and convert it to a Python dictionary
    data = request.get_json()
    #check if data exists and is a dictionary
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid input. JSON data is required."}), 400

    # read name and email from the dictionary   
    name = data.get('name')
    email = data.get('email')

    #data validation: check if name and email are provided in the right format,
    #used individual 
    # checks to be specific about what is wrong with the input, instead of a generic error message for user comfort and clarity
    if not name:
        return jsonify({"error": "Invalid input. Name is required."}), 400
    if not email:
        return jsonify({"error": "Invalid input. Email is required."}), 400
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid input. Email format is incorrect."}), 400

    # create a new User object with the values from the dictionary
    new_user = User(name=name, email=email)

    # add to the session(staging area) then commit(save to database)
    db.session.add(new_user)
    db.session.commit()

    # return the new user's profile as JSON with 201 Created status
    return jsonify(new_user.get_profile()), 201

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.get_profile()), 200

if __name__ == '__main__':
    app.run(debug=True)




