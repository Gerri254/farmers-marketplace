import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Marketplace from "./buyer/Marketplace";
import Cart from "./buyer/Cart";
import Orders from "./buyer/Orders";
import Profile from "./buyer/Profile";
import ProductDetails from "./ProductDetails";
import Checkout from "./buyer/Checkout";
import Payment from "./buyer/Payment";
import MatchedFarmers from "./buyer/MatchedFarmers";
import { Home, ShoppingCart, List, User, Heart, Users } from "lucide-react";
import "./buyer/buyer.css";
import { motion } from "framer-motion";

const BuyerDashboard = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Marketplace",
      path: "/buyer-dashboard/marketplace",
      icon: <Home />,
    },
    { name: "Cart", path: "/buyer-dashboard/cart", icon: <ShoppingCart /> },
    { name: "Orders", path: "/buyer-dashboard/orders", icon: <List /> },
    { name: "Matched Farmers", path: "/buyer-dashboard/matched-farmers", icon: <Users /> },
    { name: "Profile", path: "/buyer-dashboard/profile", icon: <User /> },
    { name: "Wishlist", path: "/buyer-dashboard/wishlist", icon: <Heart /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white text-gray-800 p-6 flex flex-col fixed h-full shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-green-600">Buyer Dashboard</h1>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition duration-300 ${
                location.pathname === item.path
                  ? "bg-green-600 text-white shadow-md"
                  : "hover:bg-gray-200"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64 bg-gray-50">
        <Routes>
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="matched-farmers" element={<MatchedFarmers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/:id" element={<Payment />} />
          <Route path="*" element={<Navigate to="/buyer-dashboard/marketplace" />} />
        </Routes>
      </main>
    </div>
  );
};

export default BuyerDashboard;