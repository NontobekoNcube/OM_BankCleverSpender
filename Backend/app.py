from flask import Flask, request, jsonify
from db import create_tables, connect_db
from user import User

app = Flask(__name__)
create_tables()

@app.route('/')
def home():
    return jsonify({"message": "CleverSpender API is running! 🚀"})

@app.route('/user/register', methods=['POST'])
def register_user():
    data = request.get_json()  # gets JSON sent from frontend
    name = data['name']
    email = data['email']

    conn = connect_db()
    cursor = conn.cursor()
    # saves new user to database
    cursor.execute('INSERT INTO users (name, email) VALUES (?, ?)', (name, email))
    conn.commit()
    user_id = cursor.lastrowid  # gets the id SQLite just assigned
    conn.close()

    user = User(name, email, user_id)
    return jsonify(user.get_profile()), 201

if __name__ == '__main__':
    app.run(debug=True)