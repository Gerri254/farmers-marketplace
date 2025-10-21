import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { farmerLogin, buyerLogin } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = { email, password, role };
      let response;

      if (role === "farmer") {
        response = await farmerLogin(formData);
        navigate("/farmer-dashboard/my-products");
      } else {
        response = await buyerLogin(formData);
        navigate("/buyer-dashboard/marketplace");
      }

      // Store user token in cookies (valid for 1 day)
      Cookies.set("token", response.data.token, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("role", role, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("id", response.data.id, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <p className="text-sm mt-5 text-center text-gray-700">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;