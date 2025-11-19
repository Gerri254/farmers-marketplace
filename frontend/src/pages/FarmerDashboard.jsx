import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import AddProduct from "./farmer/AddProduct";
import MyProducts from "./farmer/MyProducts";
import Orders from "./farmer/Orders";
import Profile from "./farmer/Profile";
import FarmProfile from "./farmer/FarmProfile";
import CropRecommendations from "./farmer/CropRecommendations";
import RecommendationDetails from "./farmer/RecommendationDetails";
import MatchedBuyers from "./farmer/MatchedBuyers";
import { PlusCircle, Package, ShoppingBag, User, Sprout, MapPin, Users } from "lucide-react";
import "./farmer/farmer.css";
import { motion } from "framer-motion";

const FarmerDashboard = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Add Product",
      path: "/farmer-dashboard/add-product",
      icon: <PlusCircle />,
    },
    {
      name: "My Products",
      path: "/farmer-dashboard/my-products",
      icon: <Package />,
    },
    { name: "Orders", path: "/farmer-dashboard/orders", icon: <ShoppingBag /> },
    { name: "AI Recommendations", path: "/farmer-dashboard/recommendations", icon: <Sprout /> },
    { name: "Farm Profile", path: "/farmer-dashboard/farm-profile", icon: <MapPin /> },
    { name: "Matched Buyers", path: "/farmer-dashboard/matched-buyers", icon: <Users /> },
    { name: "Profile", path: "/farmer-dashboard/profile", icon: <User /> },
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
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-500">Farmer Dashboard</h1>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition duration-300 ${
                location.pathname === item.path
                  ? "bg-orange-500 text-white shadow-md"
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
          <Route path="add-product" element={<AddProduct />} />
          <Route path="my-products" element={<MyProducts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="recommendations" element={<CropRecommendations />} />
          <Route path="recommendation/:id" element={<RecommendationDetails />} />
          <Route path="farm-profile" element={<FarmProfile />} />
          <Route path="matched-buyers" element={<MatchedBuyers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/farmer-dashboard/my-products" />} />
        </Routes>
      </main>
    </div>
  );
};

export default FarmerDashboard;