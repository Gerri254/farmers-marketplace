import { useEffect, useState } from "react";
import { fetchUserCount, fetchOrderCount, fetchProductCount } from "../api";
import Sidebar from "../components/Sidebar";
import {
  FaUsers,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./admin.css";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    completed: 0,
    confirmed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const getUserCount = async () => {
      try {
        const response = await fetchUserCount();
        setUserCount(response.data.userCount);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    const getProductCount = async () => {
      try {
        const response = await fetchProductCount();
        setProductCount(response.data.productCount);
      } catch (error) {
        console.error("Error fetching product count:", error);
      }
    };

    const getOrderStats = async () => {
      try {
        const response = await fetchOrderCount();
        setOrderStats(response.data); // Assuming API returns { pending, completed, confirmed, cancelled }
      } catch (error) {
        console.error("Error fetching order stats:", error);
      }
    };

    getUserCount();
    getProductCount();
    getOrderStats();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-violet-800 mb-6">
            Admin Dashboard
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Users"
            value={userCount}
            icon={<FaUsers />}
            color="bg-violet-800"
          />
          <StatCard
            title="Total Products"
            value={productCount}
            icon={<FaShoppingCart />}
            color="bg-indigo-500"
          />
          <StatCard
            title="Orders Pending"
            value={orderStats.pending}
            icon={<FaShoppingCart />}
            color="bg-yellow-400"
          />
          <StatCard
            title="Orders Confirmed"
            value={orderStats.confirmed}
            icon={<FaCheckCircle />}
            color="bg-green-500"
          />
          <StatCard
            title="Orders Completed"
            value={orderStats.completed}
            icon={<FaCheckCircle />}
            color="bg-blue-500"
          />
          <StatCard
            title="Orders Cancelled"
            value={orderStats.cancelled}
            icon={<FaTimesCircle />}
            color="bg-red-500"
          />
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center ${color} text-white p-6 rounded-lg shadow-lg`}
    >
      <div className="text-4xl">{icon}</div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;