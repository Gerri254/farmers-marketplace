import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { addProduct } from "../../api";
import Cookies from "js-cookie";
import Button from "../../components/Button";
import Input from "../../components/Input";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    unit: "kg",
    category: "Fruits",
    description: "",
    stock: "",
    productImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProduct((prev) => ({ ...prev, productImage: file }));

    // Preview image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Fetch farmerId from cookies
    const farmerId = Cookies.get("id");
    if (!farmerId) {
      toast.error("Farmer ID not found. Please log in again.");
      return;
    }

    // Append farmerId and other product data
    formData.append("farmerId", farmerId);
    Object.entries(product).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const loadingToast = toast.loading("Adding product...");
    try {
      await addProduct(formData);
      toast.success("Product added successfully!", { id: loadingToast });
      setProduct({
        name: "",
        price: "",
        unit: "kg",
        category: "Fruits",
        description: "",
        stock: "",
        productImage: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.message || "Failed to add product.", { id: loadingToast });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-green-600">Add New Product</h1>
        <p className="text-gray-600 mb-6">Fill in the details to list your product on the marketplace</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            name="name"
            placeholder="e.g., Fresh Organic Tomatoes"
            label="Product Name"
            value={product.name}
            onChange={handleChange}
            required
          />

          {/* Price and Unit */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                type="number"
                name="price"
                placeholder="0.00"
                label="Price (KSh)"
                value={product.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={product.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              >
                <option value="kg">Kg</option>
                <option value="liters">Liters</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>
          </div>

          {/* Category and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              >
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy">Dairy Products</option>
                <option value="Meat">Meat</option>
                <option value="Grains">Grains</option>
              </select>
            </div>
            <Input
              type="number"
              name="stock"
              placeholder="Available quantity"
              label="Stock Available"
              value={product.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              name="description"
              placeholder="Describe your product, its quality, origin, etc."
              value={product.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all min-h-[100px]"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-auto object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setProduct({ ...product, productImage: null });
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="productImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Add Product to Marketplace
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AddProduct;
