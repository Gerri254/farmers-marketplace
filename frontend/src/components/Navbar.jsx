import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { FaBars, FaTimes, FaShoppingCart, FaHeart } from "react-icons/fa";
import { logout } from "../api";
import Button from "./Button";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = !!Cookies.get("token");
  const userRole = Cookies.get("role");

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/");
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isBuyerDashboard = location.pathname.includes("/buyer-dashboard");

  return (
    <nav className="bg-white text-gray-800 p-4 fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl md:text-3xl font-extrabold tracking-wide"
          >
            <span className="text-green-600">Agri</span>
            <span className="text-gray-800">Link</span>
          </motion.h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-green-600 transition duration-300 font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-green-600 transition duration-300 font-medium"
          >
            About
          </Link>

          {/* Cart & Wishlist Icons for Buyers */}
          {isAuthenticated && isBuyerDashboard && (
            <>
              <Link
                to="/buyer-dashboard/wishlist"
                className="relative text-gray-700 hover:text-green-600 transition duration-300"
                aria-label="Wishlist"
              >
                <FaHeart className="text-2xl" />
              </Link>
              <Link
                to="/buyer-dashboard/cart"
                className="relative text-gray-700 hover:text-green-600 transition duration-300"
                aria-label="Shopping Cart"
              >
                <FaShoppingCart className="text-2xl" />
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          ) : (
            <Button onClick={handleLogout} variant="danger" size="sm">
              Logout
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-2"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 transition duration-300 font-medium py-2"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-green-600 transition duration-300 font-medium py-2"
              >
                About
              </Link>

              {/* Mobile Cart & Wishlist for Buyers */}
              {isAuthenticated && isBuyerDashboard && (
                <>
                  <Link
                    to="/buyer-dashboard/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition duration-300 font-medium py-2"
                  >
                    <FaHeart /> Wishlist
                  </Link>
                  <Link
                    to="/buyer-dashboard/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition duration-300 font-medium py-2"
                  >
                    <FaShoppingCart /> Cart
                  </Link>
                </>
              )}

              {!isAuthenticated ? (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Login
                  </Button>
                </Link>
              ) : (
                <Button onClick={handleLogout} variant="danger" size="sm" className="w-full">
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;