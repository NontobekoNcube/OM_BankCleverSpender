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

    # method to check if the current time falls within the specified time window,
    # so notifications can be sent accordingly. This function is called by the notification engine to determine if a notification should be sent based on the current time and the schedule's time window.
    def is_within_window(self, current_time):
        if self.time_window == "morning":
            return "06:00" <= current_time < "12:00"
        elif self.time_window == "afternoon":
            return "12:00" <= current_time <= "16:59"
        elif self.time_window == "evening":
            return "17:00" <= current_time <= "20:59"
        elif self.time_window == "night":
            return "21:00" <= current_time <= "05:59"
        return False
        