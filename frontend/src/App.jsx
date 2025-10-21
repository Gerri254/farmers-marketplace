import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/buyer/Checkout";

// Buyer Pages
import BuyerDashboard from "./pages/BuyerDashboard";
import Marketplace from "./pages/buyer/Marketplace";
import Cart from "./pages/buyer/Cart";
import Orders from "./pages/buyer/Orders";
import Profile from "./pages/buyer/Profile";
import Wishlist from "./pages/buyer/Wishlist";
import Payment from "./pages/buyer/Payment";

// Farmer Pages
import FarmerDashboard from "./pages/FarmerDashboard";
import AddProduct from "./pages/farmer/AddProduct";
import MyProducts from "./pages/farmer/MyProducts";
import ProfileFarmer from "./pages/farmer/Profile";
import OrdersFarmer from "./pages/farmer/Orders";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

function ConditionalFooter() {
  const location = useLocation();
  const hideFooterOn = ["/login", "/register"];

  if (
    hideFooterOn.includes(location.pathname) ||
    location.pathname.includes("-dashboard")
  ) {
    return null;
  }

  return <Footer />;
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            {/* <Route path="/product/:id" element={<ProductDetails />} /> */}

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Buyer Routes */}
              <Route path="/buyer-dashboard/*" element={<BuyerDashboard />}>
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={<Orders />} />
                <Route path="profile" element={<Profile />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="payment" element={<Payment />} />
                <Route path="wishlist" element={<Wishlist />} />
              </Route>

              {/* Farmer Routes */}
              <Route path="/farmer-dashboard/*" element={<FarmerDashboard />}>
                <Route path="add-product" element={<AddProduct />} />
                <Route path="my-products" element={<MyProducts />} />
                <Route path="orders" element={<OrdersFarmer />} />
                <Route path="profile" element={<ProfileFarmer />} />
              </Route>
            </Route>
          </Routes>
        </div>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

export default App;
