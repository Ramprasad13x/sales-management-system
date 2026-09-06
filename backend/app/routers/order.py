from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_admin
from app.database.session import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderUpdate,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# ============================================================
# CREATE ORDER
# ============================================================

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check customer exists
    customer = (
        db.query(Customer)
        .filter(Customer.id == order_data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    # Check all products before creating order
    products = []

    for item_data in order_data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item_data.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item_data.product_id} not found",
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.id} is inactive",
            )

        if item_data.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.id}",
            )

        products.append((item_data, product))

    # Calculate authoritative total from database prices
    total_amount = Decimal("0.00")

    for item_data, product in products:
        total_amount += product.price * item_data.quantity

    # Create order
    order = Order(
        customer_id=order_data.customer_id,
        salesman_id=current_user["id"],
        status="pending",
        total_amount=total_amount,
    )

    db.add(order)
    db.flush()

    # Create order items and reduce stock
    for item_data, product in products:
        subtotal = product.price * item_data.quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item_data.quantity,
            unit_price=product.price,
            subtotal=subtotal,
        )

        db.add(order_item)

        product.stock -= item_data.quantity

    db.commit()
    db.refresh(order)

    return order


# ============================================================
# GET ORDERS
# ============================================================

@router.get(
    "",
    response_model=list[OrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Admin can see all orders
    if current_user["role"] == "admin":
        return (
            db.query(Order)
            .order_by(Order.id.desc())
            .all()
        )

    # Salesman can see only their own orders
    return (
        db.query(Order)
        .filter(Order.salesman_id == current_user["id"])
        .order_by(Order.id.desc())
        .all()
    )


# ============================================================
# GET SINGLE ORDER
# ============================================================

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = (
        db.query(Order)
        .filter(Order.id == order_id)
    )

    # Non-admin users can only access their own order
    if current_user["role"] != "admin":
        query = query.filter(
            Order.salesman_id == current_user["id"]
        )

    order = query.first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order


# ============================================================
# UPDATE ORDER
# ============================================================
@router.put(
    "/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    update_data = order_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)

    return order

    query = (
        db.query(Order)
        .filter(Order.id == order_id)
    )

    # Salesman can update only their own order
    if current_user["role"] != "admin":
        query = query.filter(
            Order.salesman_id == current_user["id"]
        )

    order = query.first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    update_data = order_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)

    return order


# ============================================================
# DELETE ORDER
# ============================================================

@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Get all items belonging to this order
    order_items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    # Restore product stock
    for item in order_items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product:
            product.stock += item.quantity

    # Delete the order
    db.delete(order)
    db.commit()

    return None