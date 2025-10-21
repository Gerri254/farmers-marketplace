import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getProductDetails, getFarmerProfile, pushToCart } from "../api";
import { FaPhone, FaMapMarkerAlt, FaStar, FaHeart } from "react-icons/fa";
import Cookies from "js-cookie";
import Button from "../components/Button";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerLoading, setFarmerLoading] = useState(true);
  const [farmerError, setFarmerError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductDetails(id);
        setProduct(response.data.product);
        if (response.data.product && response.data.product.farmerId) {
          fetchFarmerDetails(response.data.product.farmerId);
        } else {
          setFarmerLoading(false);
        }
      } catch (err) {
        setError("Failed to load product details.");
        setFarmerLoading(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchFarmerDetails = async (farmerId) => {
      try {
        const response = await getFarmerProfile(farmerId);
        if (response.data) {
          setFarmer(response.data);
        } else {
          setFarmerError("Farmer information not available.");
        }
      } catch (err) {
        setFarmerError("Failed to load farmer details.");
      } finally {
        setFarmerLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setLoading(false);
      setFarmerLoading(false);
      setError("No product ID provided.");
    }
  }, [id]);

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.some((item) => item._id === id));
    } catch (error) {
      console.error("Error parsing wishlist from localStorage:", error);
      setIsWishlisted(false);
    }
  }, [id]);

  const toggleWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const productIndex = wishlist.findIndex((item) => item._id === id);

      if (productIndex > -1) {
        wishlist.splice(productIndex, 1);
        toast.success("Removed from wishlist");
      } else {
        wishlist.push(product);
        toast.success("Added to wishlist");
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error parsing or updating wishlist in localStorage:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const addToCart = async () => {
    if (!product) return;

    const buyerId = Cookies.get("id");

    if (!buyerId) {
      toast.error("You need to be logged in to add items to the cart.");
      return;
    }

    const cartItem = {
      buyerId,
      product: {
        ...product,
        quantity: 1,
      },
    };

    const loadingToast = toast.loading("Adding to cart...");
    try {
      await pushToCart(cartItem);
      toast.success(`${product.name} added to cart!`, { id: loadingToast });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart.", { id: loadingToast });
    }
  };

  if (loading) return <p className="p-6 text-center">Loading product...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!product) return <p className="p-6 text-center">Product not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-2xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Details */}
        <div className="bg-gradient-to-br from-green-100 to-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <img
            src={
              product.productImage
                ? `${import.meta.env.VITE_BACKEND_URL}/${product.productImage}`
                : "https://via.placeholder.com/400"
            }
            alt={product.name}
            className="w-full mt-4 rounded-xl shadow-md"
          />
          <div className="mt-4 text-gray-700">
            <p className="text-lg font-semibold">Price:</p>
            <p className="text-2xl font-bold text-green-600">
              KSh {product.price} {product.unit}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-lg font-semibold text-gray-700">Description:</p>
            <p className="text-gray-600">{product.description}</p>
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={addToCart}
              className="w-full"
            >
              Add to Cart 🛒
            </Button>
            <Button
              onClick={toggleWishlist}
              className={`w-full ${isWishlisted ? "bg-red-500" : "bg-gray-300 text-gray-800"}`}
            >
              <FaHeart className="mr-2" />
              {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>
        </div>

        {/* Farmer Details */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-lg">
          {farmerLoading ? (
            <p className="p-4 text-center">Loading farmer details...</p>
          ) : farmerError ? (
            <p className="p-4 text-center text-red-500">{farmerError}</p>
          ) : farmer ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                👨‍🌾 Farmer Details
              </h2>
              <p className="mt-3 flex items-center gap-2">
                <span className="font-semibold text-gray-700">Name:</span>
                {farmer.name || "N/A"}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                <span className="font-semibold text-gray-700">Phone:</span>{" "}
                {farmer.phone || "N/A"}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-gray-700">Farm Name:</span>{" "}
                {(farmer.farm && farmer.farm.farmName) || "N/A"}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500" />
                <span className="font-semibold text-gray-700">
                  Location:
                </span>{" "}
                {(farmer.farm && farmer.farm.location) || "N/A"}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="font-semibold text-gray-700">Rating:</span>
                {farmer.rating || "No ratings yet"} / 5
              </p>
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">
              No farmer information available for this product
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;