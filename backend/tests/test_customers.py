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
    # Use your existing salesman account.
    # Change ONLY the email if your salesman email is different.
    response = client.post(
        "/auth/login",
        json={
            "email": "salesman@example.com",
            "password": "Salesman@123",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_get_customers():
    token = get_admin_token()

    response = client.get(
        "/customers",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_get_customer():
    token = get_admin_token()

    response = client.get(
        "/customers/1",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert "name" in data
    assert "phone" in data
    assert "email" in data
    assert "address" in data


def test_get_customer_not_found():
    token = get_admin_token()

    response = client.get(
        "/customers/999999",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 404


def test_salesman_cannot_create_customer():
    token = get_salesman_token()

    response = client.post(
        "/customers",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "name": "Test Customer",
            "phone": "9000000000",
            "email": "testcustomer@example.com",
            "address": "Chennai",
        },
    )

    assert response.status_code == 403