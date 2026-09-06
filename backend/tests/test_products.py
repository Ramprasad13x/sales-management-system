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


def test_get_products():
    token = get_admin_token()

    response = client.get(
        "/products",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_get_product():
    token = get_admin_token()

    response = client.get(
        "/products/3",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 3
    assert "name" in data
    assert "sku" in data
    assert "price" in data
    assert "stock" in data
    assert "is_active" in data


def test_get_product_not_found():
    token = get_admin_token()

    response = client.get(
        "/products/999999",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 404