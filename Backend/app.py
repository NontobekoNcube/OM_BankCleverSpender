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
    data = request.get_json()  # gets JSON sent from frontend
    name = data['name']
    email = data['email']

    new_user = User(name=name, email=email)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.get_profile()), 201

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.get_profile()), 200

if __name__ == '__main__':
    app.run(debug=True)




