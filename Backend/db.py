#sqlite3 is built into the standard library, so we don't need to install it separately
import sqlite3
def connect_db():
    conn = sqlite3.connect('cleverspender.db')
    return conn

def create_tables():
    conn= connect_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
        )
''')
    conn.commit()
    conn.close()
    