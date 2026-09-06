import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, customersResponse] =
        await Promise.all([
          api.get("/orders"),
          api.get("/customers"),
        ]);

      setOrders(ordersResponse.data);
      setCustomers(customersResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (customer) => customer.id === customerId
    );

    return customer
      ? customer.name
      : `Customer #${customerId}`;
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await api.put(
        `/orders/${orderId}`,
        {
          status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? response.data
            : order
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search + status filter
  const filteredOrders = orders.filter((order) => {
    const customerName = getCustomerName(
      order.customer_id
    ).toLowerCase();

    const searchText = search
      .toLowerCase()
      .trim();

    const matchesSearch =
      searchText === "" ||
      order.id.toString().includes(searchText) ||
      customerName.includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <h2>Loading orders...</h2>;
  }

  return (
    <div>
      <h1>Orders</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <button
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>

      <button
        onClick={() => navigate("/create-order")}
        style={{ marginLeft: "10px" }}
      >
        Create New Order
      </button>

      <hr />

      {/* SEARCH AND FILTER */}
      <h2>Search & Filter</h2>

      <div>
        <input
          type="text"
          placeholder="Search Order ID or Customer name"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={{ marginLeft: "10px" }}
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

          <option value="completed">
            Completed
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

      <hr />

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : filteredOrders.length === 0 ? (
        <p>
          No orders match your search/filter.
        </p>
      ) : (
        <>
          <p>
            Showing {filteredOrders.length} of{" "}
            {orders.length} orders
          </p>

          <table
            border="1"
            cellPadding="10"
          >
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    {getCustomerName(
                      order.customer_id
                    )}
                  </td>

                  <td>
                    <select
                      value={order.status}
                      disabled={
                        updatingId === order.id
                      }
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

                      <option value="completed">
                        Completed
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
        </>
      )}
    </div>
  );
}

export default Orders;
