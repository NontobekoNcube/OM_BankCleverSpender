from db import db 

# create user model to represent a user in the system
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)


    def get_profile(self):
        # returns user data as a dictionary for the API to send back.
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email
            }
        
