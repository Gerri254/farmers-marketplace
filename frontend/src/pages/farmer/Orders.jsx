import React, { useState, useEffect } from "react";
import { fetchFarmerOrders, confirmOrders } from "../../api";
import { format } from "date-fns";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await fetchFarmerOrders();
        setOrders(response.data.orders || []);
        //console.log(response.data.orders);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const confirmOrder = async (id) => {
    try {
      await confirmOrders(id);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status: "Confirmed" } : order
        )
      );
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await confirmOrders(id);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading orders...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Farmer Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4">No orders yet.</p>
      ) : (
        <div className="mt-4">
          <ul>
            {orders.map((order) => (
              <li
                key={order._id}
                className="p-4 bg-gray-100 rounded-lg mb-2 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  {order.product ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/${order.product.productImage}`}
                      alt={order.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <p className="text-red-500">Product data missing</p>
                  )}

                  <div>
                    <p className="font-semibold">
                      {order.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.product?.description || "No description available"}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      KES {order.product?.price || "N/A"} /{" "}
                      {order.product?.unit || "-"}
                    </p>
                    <p className="text-sm">
                      Quantity:{" "}
                      <strong>{order.product?.quantity || "N/A"}</strong>
                    </p>
                    <p className="text-sm">
                      Total: <strong>KES {order.totalAmount || "N/A"}</strong>
                    </p>
                    <p className="text-sm">
                      Status:{" "}
                      <span
                        className={`px-2 py-1 rounded ${
                          order.status === "Pending"
                            ? "bg-yellow-300"
                            : order.status === "Confirmed"
                            ? "bg-green-300"
                            : "bg-red-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Ordered on:{" "}
                      {order.createdAt
                        ? format(new Date(order.createdAt), "PPpp")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {/* Confirm & Cancel Buttons */}
                {order.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmOrder(order._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;
