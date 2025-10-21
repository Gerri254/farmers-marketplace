import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchOrderDetails, processPayment } from "../../api";

const Payment = () => {
  const { id } = useParams(); // Get order ID from URL
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Mpesa"); // Default method
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For navigation after payment

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const response = await fetchOrderDetails(id);
        setOrder(response.data.order);
        //console.log(response.data.order);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [id]);

  const handlePayment = async () => {
    if (!window.confirm("Confirm payment?")) return;
    setIsProcessing(true);

    try {
      const response = await processPayment(id, paymentMethod);
      alert(response.data.message); // Display response message
      navigate("/buyer-dashboard/orders"); // Redirect to orders page
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
      <p className="text-gray-600 mt-2">
        Complete your payment for Order #{order._id}
      </p>

      {/* Order Summary */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <p className="text-gray-700">
          Product: <span className="font-medium">{order.product.name}</span>
        </p>
        <p className="text-gray-700">
          Total Amount:{" "}
          <span className="text-green-600 font-bold">
            KES {order.totalAmount}
          </span>
        </p>
      </div>

      {/* Payment Methods */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Select Payment Method</h2>
        <div className="mt-2 flex flex-col gap-3">
          {["Mpesa", "Credit Card", "Bank"].map((method) => (
            <label
              key={method}
              className="flex items-center gap-3 p-3 border rounded-md cursor-pointer"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full mt-6 p-3 text-white font-bold rounded-lg transition ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isProcessing ? "Processing..." : `Pay with ${paymentMethod}`}
      </button>

      {/* Cancel Button */}
      <Link
        to="/buyer-dashboard/orders"
        className="block text-center mt-4 text-red-600 hover:underline"
      >
        Cancel Payment
      </Link>
    </div>
  );
};

export default Payment;
