import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { confirmOrder, viewCart } from "../../api";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch cart details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await viewCart();
        setCartItems(response.data.cart.products || []);
      } catch (err) {
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      await confirmOrder();
      alert("Order confirmed successfully!");
      navigate("/buyer-dashboard/orders");
    } catch (err) {
      alert("Failed to confirm order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Confirm Your Order</h1>
      {cartItems.length === 0 ? (
        <p className="mt-4">Your cart is empty.</p>
      ) : (
        <div className="mt-4">
          <ul>
            {cartItems.map((item) => (
              <li
                key={item._id}
                className="p-4 bg-gray-100 rounded-lg mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-lg font-bold text-green-600">
                    KES {item.price} x {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-4">Total: KES {totalPrice}</h2>
          <button
            onClick={handleConfirmOrder}
            className="mt-4 block w-full p-4 bg-green-600 text-white rounded-lg text-center hover:bg-green-700 transition"
            disabled={submitting}
          >
            {submitting ? "Confirming..." : "Confirm Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
