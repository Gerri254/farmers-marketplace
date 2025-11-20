import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoTrashBinSharp } from "react-icons/io5";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { viewCart, updateCart, removeFromCart } from "../../api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await viewCart();
        const products = response.data.cart.products || [];
        setCartItems(products);
      } catch (err) {
        // Handle 404 as an empty cart (no cart exists yet)
        if (err.response && err.response.status === 404) {
          setCartItems([]);
        } else {
          setError("Failed to load cart items.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Update quantity in backend
  const updateCartQuantity = async (id, quantity) => {
    try {
      await updateCart({ _id: id, quantity });
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === id) {
          const newQuantity = item.quantity + 1;
          updateCartQuantity(id, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Decrease quantity (not below 1)
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === id && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          updateCartQuantity(id, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const handleRemoveFromCart = async (id) => {
    const confirmRemove = window.confirm("Remove this item from your cart?");
    if (!confirmRemove) return;

    try {
      await removeFromCart(id);
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (err) {
      alert("Failed to remove item.");
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          Review and manage your selected items
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-2 text-gray-500">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/buyer-dashboard/marketplace"
            className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Cart Items{" "}
                  <span className="text-gray-500 text-sm ml-2">
                    ({cartItems.length} items)
                  </span>
                </h2>
              </div>

              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li
                    key={item._id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/${item.productImage}`}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-md shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/150?text=No+Image";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                            <p className="text-green-600 font-medium mt-1">
                              KES {item.price} / {item.unit}
                            </p>
                          </div>

                          <div className="flex items-center mt-4 sm:mt-0">
                            <button
                              onClick={() => handleRemoveFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200"
                              aria-label="Remove item"
                            >
                              <IoTrashBinSharp className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center">
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                              onClick={() => decreaseQuantity(item._id)}
                              disabled={item.quantity <= 1}
                              className={`p-2 ${
                                item.quantity <= 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <AiOutlineMinus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-1 text-center w-12 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item._id)}
                              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              <AiOutlinePlus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="ml-auto text-right">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="text-lg font-semibold">
                              KES{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">
                      KES {totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Delivery Fee</p>
                    <p className="font-medium">Calculated at checkout</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-lg font-bold text-green-700">
                        KES {totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Taxes and delivery calculated at checkout
                    </p>
                  </div>
                </div>

                <Link
                  to="/buyer-dashboard/checkout"
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition duration-200"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/buyer-dashboard/marketplace"
                  className="mt-4 w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center justify-center transition duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
