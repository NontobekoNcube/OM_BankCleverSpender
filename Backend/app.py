from flask import Flask, jsonify, request
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

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "User not found"}), 404

    user = User(row[1], row[2], row[0])
    return jsonify(user.get_profile()), 200

if __name__ == '__main__':
    app.run(debug=True)




