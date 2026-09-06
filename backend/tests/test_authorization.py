from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def get_admin_token():
    response = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin@123",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def get_salesman_token():
    response = client.post(
        "/auth/login",
        json={
            "email": "salesman@example.com",
            "password": "Salesman@123",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_salesman_cannot_create_customer():
    token = get_salesman_token()

    response = client.post(
        "/customers",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "name": "Unauthorized Customer",
            "phone": "9999999999",
            "email": "unauthorized@example.com",
            "address": "Test",
        },
    )

    assert response.status_code == 403


def test_salesman_cannot_create_product():
    token = get_salesman_token()

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "name": "Unauthorized Product",
            "sku": "UNAUTH-001",
            "description": "Test",
            "price": 100,
            "stock": 10,
            "is_active": True,
        },
    )

    assert response.status_code == 403
