import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

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

  const clearForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      setSaving(true);

      const customerData = {
        name,
        phone,
        email: email || null,
        address: address || null,
      };

      if (editingId) {
        await api.put(
          `/customers/${editingId}`,
          customerData
        );

        setMessage("Customer updated successfully.");
      } else {
        await api.post(
          "/customers",
          customerData
        );

        setMessage("Customer added successfully.");
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

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email || "");
    setAddress(customer.address || "");

    setError("");
    setMessage("");
  };

  const handleDelete = async (customerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/customers/${customerId}`
      );

      setMessage("Customer deleted successfully.");

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete customer"
      );
    }
  };

  const filteredCustomers = customers.filter(
    (customer) => {
      const searchText = search.toLowerCase();

      return (
        customer.name
          ?.toLowerCase()
          .includes(searchText) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchText) ||
        customer.email
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  if (loading) {
    return <h2>Loading customers...</h2>;
  }

  return (
    <div>
      <h1>Customer Management</h1>

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
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            placeholder="Address"
          />
        </div>

        <br />

        <button type="submit" disabled={saving}>
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

      <hr />

      <h2>Customers</h2>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search name, phone or email"
      />

      <br />
      <br />

      {filteredCustomers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table border="1" cellPadding="10">
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
            {filteredCustomers.map(
              (customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>

                  <td>{customer.name}</td>

                  <td>{customer.phone}</td>

                  <td>
                    {customer.email || "-"}
                  </td>

                  <td>
                    {customer.address || "-"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleEdit(customer)
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
                        marginLeft: "8px",
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
