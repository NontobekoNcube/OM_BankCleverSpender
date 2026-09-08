#import sqlalchemy toolkit 
from db import db

# create schedule model to represent a schedule in the system
class Schedule(db.Model):
    schedule_id = db.Column(db.Integer, primary_key=True)
    reminder_id = db.Column(db.Integer, db.ForeignKey('reminder.reminder_id'), nullable=False)
    time_window = db.Column(db.String(50), nullable=False)
    days = db.Column(db.String(50), nullable=False)
    exact_start = db.Column(db.String(50), nullable=True)
    exact_end = db.Column(db.String(50), nullable=True)