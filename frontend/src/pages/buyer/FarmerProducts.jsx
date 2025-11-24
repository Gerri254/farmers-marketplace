import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShoppingCart, ArrowLeft, Package } from "lucide-react";
import { getFarmerProductsByBuyer, pushToCart } from "../../api";
import Cookies from "js-cookie";

const FarmerProducts = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerProducts();
  }, [farmerId]);

  const fetchFarmerProducts = async () => {
    try {
      setLoading(true);
      const response = await getFarmerProductsByBuyer(farmerId);
      setProducts(response.data.products || []);
      setFarmerInfo(response.data.farmer);
    } catch (error) {
      toast.error("Failed to load farmer products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const buyerId = Cookies.get("id");
      await pushToCart({
        buyerId,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          productImage: product.productImage,
          category: product.category,
          quantity: 1,
        }
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/buyer-dashboard/matched-farmers")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Matched Farmers
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {farmerInfo?.name || "Farmer"}'s Products
          </h1>
          {farmerInfo?.farmProfile && (
            <div className="mt-2 text-gray-600">
              <p>Location: {farmerInfo.farmProfile.county}</p>
              {farmerInfo.farmProfile.farmSize && (
                <p>Farm Size: {farmerInfo.farmProfile.farmSize} acres</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Products Available
          </h3>
          <p className="text-gray-600">
            This farmer doesn't have any products listed yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {product.productImage ? (
                  <img
                    src={`http://localhost:3000/${product.productImage}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Package size={48} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    KES {product.price}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Stock: {product.stock} units</span>
                  {product.unit && <span>Unit: {product.unit}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/buyer-dashboard/product/${product._id}`)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
