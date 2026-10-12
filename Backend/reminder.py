#import sqlalchemy toolkit
from db import db

# create reminder model to represent a reminder in the system
class Reminder(db.Model):
    reminder_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.schedule_id'), nullable=True)
    focus = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    goal = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def toggle_active(self):
        # toggles the is_active status of the reminder, switching between active and inactive states. This function is called when a user wants to enable or disable clever spender
        self.is_active = not self.is_active
        db.session.commit()

    def update_focus(self, new_focus):
        # updates the focus of the reminder
        self.focus = new_focus
        db.session.commit()

    def update_goal(self, new_goal):
        # updates the goal of the reminder
        self.goal = new_goal
        db.session.commit()

    