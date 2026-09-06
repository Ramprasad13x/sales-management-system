import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(
          `/products/${productId}`
        );

        setProduct(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div>
      <h1>Product Details</h1>

      <hr />

      <p>
        <strong>Name:</strong> {product.name}
      </p>

      <p>
        <strong>SKU:</strong> {product.sku}
      </p>

      <p>
        <strong>Description:</strong>{" "}
        {product.description || "No description"}
      </p>

      <p>
        <strong>Price:</strong> ₹{product.price}
      </p>

      <p>
        <strong>Stock:</strong> {product.stock}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {product.is_active ? "Active" : "Inactive"}
      </p>

      <button onClick={() => navigate("/products")}>
        Back to Products
      </button>
    </div>
  );
}

export default ProductDetails;