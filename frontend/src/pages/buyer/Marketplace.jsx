import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { getProducts } from "../../api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { motion } from "framer-motion";

const PRODUCTS_PER_PAGE = 10;

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts(
          currentPage,
          PRODUCTS_PER_PAGE,
          debouncedSearchTerm,
          selectedCategory
        );

        if (!response?.data?.products) throw new Error("Invalid API response");

        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearchTerm, selectedCategory]);

  const SkeletonCard = () => (
    <div className="flex flex-col p-5 rounded-xl shadow-lg bg-white">
      <div className="w-full h-52 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="mt-4">
        <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-green-600">
          Marketplace
        </h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-2/3">
            <Input
              type="text"
              placeholder="Search for products..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Category Filter */}
          <select
            className="p-4 border border-gray-300 rounded-full shadow-sm bg-white cursor-pointer focus:ring-2 focus:ring-green-500"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            {[...new Set(products.map((p) => p.category).filter(Boolean))].map(
              (category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
      </motion.div>

      {/* Product Listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <p className="text-center text-red-500 text-lg">{error}</p>
      ) : products.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col p-5 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-shadow"
            >
              {/* Product Image */}
              <img
                src={
                  product.productImage.startsWith("http")
                    ? product.productImage
                    : `${import.meta.env.VITE_BACKEND_URL}/${product.productImage}`
                }
                alt={product.name}
                className="w-full h-auto max-h-52 object-cover rounded-lg"
              />

              {/* Product Details */}
              <div className="mt-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-gray-600 mt-1 font-medium">
                  Price:{" "}
                  <span className="text-green-600 font-semibold">
                    Ksh {product.price}/{product.unit}
                  </span>
                </p>
                <p className="text-gray-500 text-sm">
                  Stock: {product.stock} {product.unit} available
                </p>
                <p className="text-gray-500 text-sm">
                  Category: {product.category}
                </p>

                {/* View Details Button */}
                <Link to={`/buyer-dashboard/product/${product._id}`} className="mt-auto">
                  <Button className="w-full mt-4">View Details</Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="col-span-full text-center text-gray-500 text-lg">
          No products found.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-3">
          <Button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>

          {[...Array(totalPages).keys()].map((num) => (
            <Button
              key={num + 1}
              onClick={() => setCurrentPage(num + 1)}
              variant={currentPage === num + 1 ? "primary" : "secondary"}
              size="sm"
            >
              {num + 1}
            </Button>
          ))}

          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;