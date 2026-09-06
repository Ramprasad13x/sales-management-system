import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const orderResponse = await api.get(
        `/orders/${orderId}`
      );

      const itemsResponse = await api.get(
        `/orders/${orderId}/items`
      );

      setOrder(orderResponse.data);
      setItems(itemsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading order...</h2>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>
          {error}
        </p>

        <button onClick={() => navigate("/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div>
      <h1>Order Details</h1>

      <button onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <hr />

      <h2>Order #{order.id}</h2>

      <p>
        <strong>Customer ID:</strong>{" "}
        {order.customer_id}
      </p>

      <p>
        <strong>Salesman ID:</strong>{" "}
        {order.salesman_id}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {order.status}
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {new Date(
          order.created_at
        ).toLocaleString()}
      </p>

      <hr />

      <h2>Products</h2>

      {items.length === 0 ? (
        <p>No products found for this order.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.product_name}
                </td>

                <td>
                  {item.quantity}
                </td>

                <td>
                  ₹
                  {Number(
                    item.unit_price
                  ).toFixed(2)}
                </td>

                <td>
                  ₹
                  {Number(
                    item.subtotal
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>
        Total: ₹
        {Number(
          order.total_amount
        ).toFixed(2)}
      </h2>
    </div>
  );
}

export default OrderDetails;
