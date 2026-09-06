from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order_item import (
    OrderItemCreate,
    OrderItemResponse,
)

router = APIRouter(
    prefix="/orders",
    tags=["Order Items"],
)


# ============================================================
# CHECK ORDER ACCESS
# ============================================================

def get_authorized_order(
    order_id: int,
    db: Session,
    current_user,
):
    query = (
        db.query(Order)
        .filter(Order.id == order_id)
    )

    # Admin can access every order
    if current_user["role"] == "admin":
        order = query.first()

    # Salesman can access only their own orders
    else:
        order = (
            query
            .filter(
                Order.salesman_id == current_user["id"]
            )
            .first()
        )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order


# ============================================================
# CREATE ORDER ITEM
# ============================================================

@router.post(
    "/{order_id}/items",
    response_model=OrderItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order_item(
    order_id: int,
    item_data: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check authorization
    order = get_authorized_order(
        order_id,
        db,
        current_user,
    )

    # Find product
    product = (
        db.query(Product)
        .filter(Product.id == item_data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Check quantity
    if item_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero",
        )

    # Check stock
    if item_data.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient product stock",
        )

    # Use database price
    unit_price = product.price

    # Calculate subtotal from database price
    subtotal = unit_price * item_data.quantity

    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=item_data.quantity,
        unit_price=unit_price,
        subtotal=subtotal,
    )

    # Reduce stock
    product.stock -= item_data.quantity

    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    return {
        "id": order_item.id,
        "order_id": order_item.order_id,
        "product_id": order_item.product_id,
        "product_name": product.name,
        "quantity": order_item.quantity,
        "unit_price": order_item.unit_price,
        "subtotal": order_item.subtotal,
    }


# ============================================================
# GET ORDER ITEMS
# ============================================================

@router.get(
    "/{order_id}/items",
    response_model=list[OrderItemResponse],
)
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check authorization
    order = get_authorized_order(
        order_id,
        db,
        current_user,
    )

    order_items = (
        db.query(OrderItem)
        .filter(
            OrderItem.order_id == order.id
        )
        .all()
    )

    result = []

    for item in order_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        result.append({
            "id": item.id,
            "order_id": item.order_id,
            "product_id": item.product_id,
            "product_name": (
                product.name
                if product
                else "Unknown Product"
            ),
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
        })

    return result
