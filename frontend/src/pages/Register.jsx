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
    farm: {
      farmName: "",
      location: {
        county: "",
      },
    },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle basic + nested fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Farm location county field
    if (name === "location_county") {
      setFormData({
        ...formData,
        farm: {
          ...formData.farm,
          location: {
            county: value,
          },
        },
      });
      return;
    }

    // Farm name
    if (name === "farmName") {
      setFormData({
        ...formData,
        farm: {
          ...formData.farm,
          farmName: value,
        },
      });
      return;
    }

    // Regular fields
    setFormData({ ...formData, [name]: value });
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

    // Required fields validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      (role === "buyer" && !address) ||
      (role === "farmer" &&
        (!farm.farmName ||
          !farm.location.county))
    ) {
      setError("All fields are required.");
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

      localStorage.setItem("token", response.data.token);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
          {/* BASIC FIELDS */}
          <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <Input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <Input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

          {/* ROLE */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>

          {/* BUYER FIELDS */}
          {formData.role === "buyer" && (
            <Input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          )}

          {/* FARMER FIELDS */}
          {formData.role === "farmer" && (
            <>
              <Input
                name="farmName"
                placeholder="Farm Name"
                value={formData.farm.farmName}
                onChange={handleChange}
              />

              <select
                name="location_county"
                value={formData.farm.location.county}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select County</option>
                <option value="Trans-Nzoia">Trans-Nzoia</option>
                <option value="Kirinyaga">Kirinyaga</option>
                <option value="Makueni">Makueni</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Uasin Gishu">Uasin Gishu</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Meru">Meru</option>
                <option value="Machakos">Machakos</option>
                <option value="Bungoma">Bungoma</option>
                <option value="Kakamega">Kakamega</option>
                <option value="Other">Other</option>
              </select>
            </>
          )}

          <Button
            type="submit"
            className={`w-full ${loading ? "bg-gray-400 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
