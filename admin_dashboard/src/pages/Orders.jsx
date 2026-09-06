import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      setOrders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setError("");
      setMessage("");

      await api.put(`/orders/${orderId}`, {
        status: newStatus,
      });

      setMessage(
        `Order #${orderId} status updated to ${newStatus}`
      );

      loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to update order status"
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      searchValue === "" ||
      String(order.id).includes(searchValue) ||
      String(order.customer_id).includes(searchValue) ||
      String(order.salesman_id).includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <h2>Loading orders...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Order Management</h1>

      <button
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <button
        onClick={loadOrders}
        style={{ marginLeft: "10px" }}
      >
        Refresh
      </button>

      <hr />

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      <h2>All Orders</h2>

      {/* SEARCH */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search Order ID, Customer ID or Salesman ID"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            padding: "10px",
            width: "350px",
          }}
        />

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={{
            padding: "10px",
            marginLeft: "10px",
          }}
        >
          <option value="all">
            All Statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          style={{ marginLeft: "10px" }}
        >
          Clear
        </button>
      </div>

      {/* ORDERS TABLE */}
      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Salesman ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  #{order.id}
                </td>

                <td>
                  {order.customer_id}
                </td>

                <td>
                  {order.salesman_id}
                </td>

                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="confirmed">
                      Confirmed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </td>

                <td>
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </td>

                <td>
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </td>

                <td>
                  <button
                    onClick={() =>
                      navigate(
                        `/orders/${order.id}`
                      )
                    }
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: "20px" }}>
        Showing {filteredOrders.length} of{" "}
        {orders.length} orders
      </p>
    </div>
  );
}

export default Orders;