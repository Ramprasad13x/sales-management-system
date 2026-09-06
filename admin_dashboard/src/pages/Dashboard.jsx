import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/me")
      .then((response) => {
        if (response.data.role !== "admin") {
          localStorage.removeItem("admin_token");
          navigate("/login");
          return;
        }

        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {user && (
        <div>
          <p>
            <strong>User ID:</strong> {user.id}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}

      <hr />

      <h2>Management</h2>

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
        onClick={() => navigate("/orders")}
        style={{ marginLeft: "10px" }}
      >
        Orders
      </button>

      <br />
      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
