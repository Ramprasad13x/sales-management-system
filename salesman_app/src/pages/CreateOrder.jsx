import { useEffect, useState } from "react";
import api from "../services/api";

function CreateOrder() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load customers and products
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customersResponse = await api.get("/customers");
      const productsResponse = await api.get("/products");

      setCustomers(customersResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load customers or products"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = () => {
    setError("");

    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    const product = products.find(
      (p) => p.id === Number(selectedProductId)
    );

    if (!product) {
      setError("Product not found");
      return;
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }

    if (qty > product.stock) {
      setError(`Only ${product.stock} units available`);
      return;
    }

    const existingItem = cart.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;

      if (newQuantity > product.stock) {
        setError(`Only ${product.stock} units available`);
        return;
      }

      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          quantity: qty,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  // Change quantity
  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(
      (p) => p.id === productId
    );

    const qty = Number(newQuantity);

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (product && qty > product.stock) {
      setError(`Only ${product.stock} units available`);
      return;
    }

    setError("");

    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  // Remove product
  const removeFromCart = (productId) => {
    setCart(
      cart.filter(
        (item) => item.product_id !== productId
      )
    );
  };

  // Calculate subtotal
  const getSubtotal = (item) => {
    return item.price * item.quantity;
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + getSubtotal(item),
    0
  );

  // Submit complete order
  const submitOrder = async () => {
    setError("");

    if (!customerId) {
      setError("Please select a customer");
      return;
    }

    if (cart.length === 0) {
      setError("Please add at least one product");
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        customer_id: Number(customerId),

        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post(
        "/orders",
        orderData
      );

      alert(
        `Order #${response.data.id} created successfully!`
      );

      // Clear form after successful order
      setCustomerId("");
      setCart([]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Create Order</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <hr />

      {/* CUSTOMER */}
      <h2>1. Select Customer</h2>

      <select
        value={customerId}
        onChange={(e) =>
          setCustomerId(e.target.value)
        }
      >
        <option value="">
          Select Customer
        </option>

        {customers.map((customer) => (
          <option
            key={customer.id}
            value={customer.id}
          >
            {customer.name} - {customer.phone}
          </option>
        ))}
      </select>

      <hr />

      {/* PRODUCT */}
      <h2>2. Add Product</h2>

      <select
        value={selectedProductId}
        onChange={(e) =>
          setSelectedProductId(e.target.value)
        }
      >
        <option value="">
          Select Product
        </option>

        {products
          .filter((product) => product.is_active)
          .map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name} - ₹{product.price} - Stock:{" "}
              {product.stock}
            </option>
          ))}
      </select>

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) =>
          setQuantity(Number(e.target.value))
        }
      />

      <button onClick={addToCart}>
        Add Product
      </button>

      <hr />

      {/* CART */}
      <h2>3. Order Items</h2>

      {cart.length === 0 ? (
        <p>No products added.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item) => (
              <tr key={item.product_id}>
                <td>{item.name}</td>

                <td>{item.sku}</td>

                <td>
                  ₹{item.price.toFixed(2)}
                </td>

                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.product_id,
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  ₹{getSubtotal(item).toFixed(2)}
                </td>

                <td>
                  <button
                    onClick={() =>
                      removeFromCart(
                        item.product_id
                      )
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* TOTAL */}
      <h2>
        Total: ₹{total.toFixed(2)}
      </h2>

      {/* SUBMIT */}
      <button
        onClick={submitOrder}
        disabled={
          !customerId ||
          cart.length === 0 ||
          submitting
        }
      >
        {submitting
          ? "Creating Order..."
          : "Submit Order"}
      </button>
    </div>
  );
}

export default CreateOrder;