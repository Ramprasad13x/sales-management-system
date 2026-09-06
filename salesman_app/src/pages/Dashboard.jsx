import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Salesman Dashboard</h1>

      {user && (
        <div>
          <p>User ID: {user.id}</p>
          <p>Role: {user.role}</p>
        </div>
      )}

      <hr />

      <h2>Sales Management</h2>

      <div>
        <button onClick={() => navigate("/customers")}>
          Customers
        </button>

        <button
          onClick={() => navigate("/products")}
          style={{ marginLeft: "10px" }}
        >
          Products
        </button>

        <button
          onClick={() => navigate("/create-order")}
          style={{ marginLeft: "10px" }}
        >
          Create Order
        </button>

        <button
          onClick={() => navigate("/orders")}
          style={{ marginLeft: "10px" }}
        >
          Orders
        </button>
      </div>

      <hr />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
