import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get all customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load customers when page opens
  useEffect(() => {
    loadCustomers();
  }, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingId(null);
  };

  // Add or update customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const customerData = {
      name,
      phone,
      email: email || null,
      address: address || null,
    };

    try {
      if (editingId) {
        // UPDATE
        await api.put(
          `/customers/${editingId}`,
          customerData
        );

        setMessage("Customer updated successfully!");
      } else {
        // CREATE
        await api.post(
          "/customers",
          customerData
        );

        setMessage("Customer added successfully!");
      }

      clearForm();

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to save customer"
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit customer
  const handleEdit = (customer) => {
    setEditingId(customer.id);

    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email || "");
    setAddress(customer.address || "");

    setMessage("");
    setError("");
  };

  // Delete customer
  const handleDelete = async (customerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/customers/${customerId}`
      );

      setMessage(
        "Customer deleted successfully!"
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete customer"
      );
    }
  };

  return (
    <div>
      <h1>Customers</h1>

      <hr />

      <h2>
        {editingId
          ? "Edit Customer"
          : "Add Customer"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <br />

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Customer name"
            required
          />
        </div>

        <br />

        <div>
          <label>Phone</label>
          <br />

          <input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone number"
            required
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
          />
        </div>

        <br />

        <div>
          <label>Address</label>
          <br />

          <input
            type="text"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            placeholder="Address"
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editingId
            ? "Update Customer"
            : "Add Customer"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={clearForm}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      <hr />

      <h2>Customer List</h2>

      {loading && (
        <p>Loading customers...</p>
      )}

      {!loading &&
        customers.length === 0 && (
          <p>No customers found.</p>
        )}

      {!loading &&
        customers.length > 0 && (
          <table
            border="1"
            cellPadding="10"
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(
                (customer) => (
                  <tr key={customer.id}>
                    <td>
                      {customer.id}
                    </td>

                    <td>
                      {customer.name}
                    </td>

                    <td>
                      {customer.phone}
                    </td>

                    <td>
                      {customer.email || "-"}
                    </td>

                    <td>
                      {customer.address || "-"}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          handleEdit(
                            customer
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            customer.id
                          )
                        }
                        style={{
                          marginLeft:
                            "10px",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
    </div>
  );
}

export default Customers;