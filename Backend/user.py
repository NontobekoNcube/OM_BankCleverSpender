# create user class to represent a user in the system
class User:
    def __init__(self, name, email, user_id=None):
        #user is None for new users, -assigned by SQLite on save.
        self.id = user_id
        self.name = name
        self.email = email

    def get_profile(self):
        # returns user data as a dictionary fofr the API to send back.
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }
    
