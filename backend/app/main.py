from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.auth.dependencies import get_current_user, require_admin
from app.database.session import engine

from app.routers.auth import router as auth_router
from app.routers.customer import router as customer_router
from app.routers.product import router as product_router
from app.routers.order import router as order_router
from app.routers.order_item import router as order_item_router


app = FastAPI(
    title="Sales Management System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sales-management-system-omega-five.vercel.app",
        "https://sales-management-system-abah.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
        }


@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user


@app.get("/admin-only")
def admin_only(current_user=Depends(require_admin)):
    return {
        "message": "Welcome Admin!",
        "user": current_user,
    }


app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(order_item_router)
