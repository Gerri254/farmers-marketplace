import { useState, useEffect } from "react";
import { fetchAllProducts, approveProduct } from "../api";
import { FaCheckCircle } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { motion } from "framer-motion";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchAllProducts();
        setProducts(response.data.products || []);
      } catch (err) {
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      const response = await approveProduct(productId);
      if (response.data.success) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? { ...product, approved: true } : product
          )
        );
      }
    } catch (err) {
      setError("Failed to approve product.");
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "approved") return product.approved;
    if (filterStatus === "pending") return !product.approved;
    return true; // Default to showing all if filterStatus is invalid
  });

  const SkeletonRow = () => (
    <tr>
      <td className="border p-2"><div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div></td>
    </tr>
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-4 text-violet-800">Manage Products</h1>

          <div className="mb-4">
            <label className="mr-2">Filter by Approval Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            {error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Image</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Stock</th>
                    <th className="border p-2">Approval Status</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="text-center">
                        <td className="border p-2">
                          <img
                            src={
                              product.productImage
                                ? product.productImage
                              : `${import.meta.env.VITE_BACKEND_URL}/${product.productImage}`
                                : "https://via.placeholder.com/100"
                            }
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                        </td>
                        <td className="border p-2">{product.name}</td>
                        <td className="border p-2">{product.category}</td>
                        <td className="border p-2">
                          {product.price} KES / {product.unit}
                        </td>
                        <td className="border p-2">{product.stock}</td>
                        <td className="border p-2">
                          {product.approved ? (
                            <span className="text-green-500">Approved</span>
                          ) : (
                            <span className="text-yellow-500">Pending</span>
                          )}
                        </td>

                        <td className="border p-2 text-center">
                          {product.approved ? (
                            <Button
                              className="bg-gray-500 cursor-not-allowed"
                              disabled
                            >
                              Approved
                            </Button>
                          ) : (
                            <Button
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(product._id)}
                            >
                              <FaCheckCircle className="mr-2" />
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 p-4">
                        No products available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;