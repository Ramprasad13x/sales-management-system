from app.database.session import engine, Base
from app.models import User, Customer, Product, Order, OrderItem


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")