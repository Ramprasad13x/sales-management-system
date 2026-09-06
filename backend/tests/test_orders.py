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


def test_get_orders():
    token = get_admin_token()

    response = client.get(
        "/orders",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_get_order():
    token = get_admin_token()

    response = client.get(
        "/orders/40",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 40
    assert "customer_id" in data
    assert "salesman_id" in data
    assert "status" in data
    assert "total_amount" in data
    assert "created_at" in data


def test_get_order_not_found():
    token = get_admin_token()

    response = client.get(
        "/orders/999999",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 404