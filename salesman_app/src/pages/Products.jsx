import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Used to navigate to product details
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText)
    );
  });

  return (
    <div>
      <h1>Products</h1>

      <hr />

      {/* Search */}
      <input
        type="text"
        placeholder="Search by product name or SKU"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      {/* Loading */}
      {loading && <p>Loading products...</p>}

      {/* Error */}
      {error && <p>{error}</p>}

      {/* No products */}
      {!loading && !error && filteredProducts.length === 0 && (
        <p>No products found.</p>
      )}

      {/* Product table */}
      {!loading && !error && filteredProducts.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>

                <td>{product.name}</td>

                <td>{product.sku}</td>

                <td>₹{product.price}</td>

                <td>{product.stock}</td>

                <td>
                  {product.is_active ? "Active" : "Inactive"}
                </td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/products/${product.id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Products;