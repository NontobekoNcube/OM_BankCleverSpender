#sqlite3 is built into the standard library, so we don't need to install it separately
import sqlite3

#get connection to the database
def connect_db():
    conn = sqlite3.connect('cleverspender.db')
    return conn

# create the tables in the database
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

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
        reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        focus TEXT NOT NULL,
        goal TEXT NOT NULL,
        is_active INTEGER,
        paused_until TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS schedules (
        schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reminder_id INTEGER NOT NULL,
        time_window TEXT NOT NULL,
        days TEXT NOT NULL,
        exact_start TEXT,
        exact_end TEXT,
        FOREIGN KEY (reminder_id) REFERENCES reminders(reminder_id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS nudge_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        response TEXT NOT NULL,
        reminder_id INTEGER NOT NULL,
        sent_at TEXT NOT NULL,
        responded_at TEXT,
        FOREIGN KEY (reminder_id) REFERENCES reminders(reminder_id)
        )
    ''')

    conn.commit()
    conn.close()
