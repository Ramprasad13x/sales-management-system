import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLEAR FORM
  // ============================================================

  const clearForm = () => {
    setName("");
    setSku("");
    setDescription("");
    setPrice("");
    setStock("");
    setIsActive(true);
    setEditingId(null);
  };

  // ============================================================
  // SUBMIT PRODUCT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required");
      return;
    }

    if (price === "" || Number(price) < 0) {
      setError("Price must be zero or greater");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setError("Stock must be zero or greater");
      return;
    }

    const productData = {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim() || null,
      price: Number(price),
      stock: Number(stock),
      is_active: isActive,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          productData
        );

        setMessage("Product updated successfully");
      } else {
        await api.post(
          "/products",
          productData
        );

        setMessage("Product added successfully");
      }

      clearForm();
      await loadProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  const handleEdit = (product) => {
    setEditingId(product.id);

    setName(product.name);
    setSku(product.sku);
    setDescription(product.description || "");
    setPrice(product.price);
    setStock(product.stock);
    setIsActive(product.is_active);

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/products/${productId}`
      );

      setMessage(
        "Product deleted successfully"
      );

      await loadProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to delete product"
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredProducts = products.filter(
    (product) => {
      const searchText =
        search.toLowerCase();

      return (
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.sku
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div>
        <h2>Loading products...</h2>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <h1>Product Management</h1>

      <button
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>

      <hr />

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      )}

      {message && (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      {/* ======================================================
          PRODUCT FORM
      ====================================================== */}

      <h2>
        {editingId
          ? "Edit Product"
          : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Product Name</strong>
          </label>
          <br />

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Enter product name"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>SKU</strong>
          </label>
          <br />

          <input
            type="text"
            value={sku}
            onChange={(e) =>
              setSku(e.target.value)
            }
            placeholder="Enter SKU"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Description</strong>
          </label>
          <br />

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Enter product description"
            rows="3"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Price</strong>
          </label>
          <br />

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            placeholder="0.00"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Stock</strong>
          </label>
          <br />

          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            placeholder="0"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(
                  e.target.checked
                )
              }
            />

            {" "}Active Product
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editingId
            ? "Update Product"
            : "Add Product"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={clearForm}
            style={{
              marginLeft: "10px",
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <hr />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <h2>Products</h2>

      <input
        type="text"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search by product name or SKU"
        style={{
          width: "300px",
          padding: "8px",
          marginBottom: "15px",
        }}
      />

      {/* ======================================================
          PRODUCTS TABLE
      ====================================================== */}

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          style={{
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(
              (product) => (
                <tr key={product.id}>
                  <td>
                    {product.id}
                  </td>

                  <td>
                    {product.name}
                  </td>

                  <td>
                    {product.sku}
                  </td>

                  <td>
                    ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </td>

                  <td>
                    {product.stock}
                  </td>

                  <td>
                    {product.is_active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td>
                    {product.description ||
                      "-"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleEdit(
                          product
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          product.id
                        )
                      }
                      style={{
                        marginLeft:
                          "5px",
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

export default Products;
