from app.auth.security import hash_password
from app.database.session import SessionLocal
from app.models.user import User


db = SessionLocal()

admin = User(
    name="Admin",
    email="admin@example.com",
    password_hash=hash_password("Admin@123"),
    role="admin",
)

db.add(admin)
db.commit()

print("Admin user created successfully!")

db.close()