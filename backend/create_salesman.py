from app.auth.security import hash_password
from app.database.session import SessionLocal
from app.models.user import User


db = SessionLocal()

salesman = User(
    name="Salesman",
    email="salesman@example.com",
    password_hash=hash_password("Salesman@123"),
    role="salesman",
)

db.add(salesman)
db.commit()

print("Salesman user created successfully!")
