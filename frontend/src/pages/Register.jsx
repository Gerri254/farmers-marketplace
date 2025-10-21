import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { farmerRegister, buyerRegister } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "buyer",
    address: "",
    farm: { location: "", farmName: "" },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "farmName" || name === "location") {
      setFormData({ ...formData, farm: { ...formData.farm, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      role,
      address,
      farm,
    } = formData;

    // Validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      (role === "buyer" && !address) ||
      (role === "farmer" && (!farm.farmName || !farm.location))
    ) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (role === "farmer") {
        response = await farmerRegister({
          name,
          email,
          password,
          phone,
          farm,
          role,
        });
      } else {
        response = await buyerRegister({
          name,
          email,
          password,
          phone,
          address,
          role,
        });
      }

      console.log("User registered:", response.data);

      localStorage.setItem("token", response.data.token);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>

          {formData.role === "buyer" && (
            <Input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          )}

          {formData.role === "farmer" && (
            <React.Fragment>
              <Input
                type="text"
                name="farmName"
                placeholder="Farm Name"
                value={formData.farm.farmName}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="location"
                placeholder="Farm Location"
                value={formData.farm.location}
                onChange={handleChange}
              />
            </React.Fragment>
          )}

          <Button
            type="submit"
            className={`w-full ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;