import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, ShoppingCart, BarChart2 } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home />,
    },
    {
      name: "Manage Users",
      path: "/users",
      icon: <Users />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <ShoppingCart />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 />,
    },
  ];

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-64 bg-white text-gray-800 p-5 shadow-lg"
    >
      <h2 className="text-xl font-bold text-center text-violet-800">Admin Panel</h2>
      <ul className="mt-4">
        {menuItems.map((item) => (
          <li key={item.path} className="py-2">
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition duration-300 ${
                location.pathname === item.path
                  ? "bg-violet-800 text-white shadow-md"
                  : "hover:bg-gray-200"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Sidebar;