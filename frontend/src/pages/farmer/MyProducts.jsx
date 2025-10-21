import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getFarmerProducts, editProduct, deleteProduct } from "../../api";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { motion, AnimatePresence } from "framer-motion";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getFarmerProducts();
        if (!response.data || !Array.isArray(response.data.products)) {
          throw new Error("Unexpected API response structure");
        }
        setProducts(response.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Are you sure you want to delete this product?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: Infinity });
    });

    if (!confirmed) return;

    const loadingToast = toast.loading("Deleting product...");
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product._id !== id));
      toast.success("Product deleted successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product. Please try again.", { id: loadingToast });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating product...");
    try {
      await editProduct(editingProduct, editingProduct._id);
      setProducts(
        products.map((p) => (p._id === editingProduct._id ? editingProduct : p))
      );
      setEditingProduct(null);
      toast.success("Product updated successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error(error.response?.data?.message || "Error updating product. Please try again.", { id: loadingToast });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonCard = () => (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
      <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="flex-1 ml-4">
        <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">My Products</h1>
          <p className="text-gray-600">Manage and update your product listings</p>
        </div>
        <div className="relative mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6"
        >
          {loading ? (
            [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                className="flex items-center bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={
                    product.productImage
                      ? `${import.meta.env.VITE_BACKEND_URL}/${product.productImage}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                />
                <div className="flex-1 ml-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-gray-700 font-medium">
                      <span className="text-green-600 font-bold text-lg">KSh {product.price}</span>
                      <span className="text-gray-500">/{product.unit}</span>
                    </p>
                    <p className="text-gray-600">
                      Stock: <span className="font-semibold">{product.stock} {product.unit}</span> available
                    </p>
                    <p className="text-gray-600">
                      Category: <span className="font-semibold">{product.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setEditingProduct(product)}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(product._id)}
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-gray-50 rounded-xl"
            >
              <p className="text-xl text-gray-500 mb-2">No products found</p>
              <p className="text-gray-400">Try adjusting your search or add new products</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <Dialog
            open={true}
            onClose={() => setEditingProduct(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditingProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md z-10"
            >
              <h2 className="text-2xl font-bold text-green-600 mb-6">Edit Product</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <Input
                  type="text"
                  label="Product Name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  placeholder="Product Name"
                  required
                />

                <Input
                  type="number"
                  label="Price per unit (KSh)"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                  placeholder="Price per unit"
                  min="0"
                  step="0.01"
                  required
                />

                <Input
                  type="number"
                  label="Stock Available"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: e.target.value,
                    })
                  }
                  placeholder="Stock Available"
                  min="0"
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="success" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProducts;