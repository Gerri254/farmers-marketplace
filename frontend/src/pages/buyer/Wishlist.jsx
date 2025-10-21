import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(storedWishlist);
    } catch (error) {
      console.error("Error parsing wishlist from localStorage:", error);
      setWishlist([]);
    }
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter((item) => item._id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-green-600 mb-6">My Wishlist</h1>
      {wishlist.length > 0 ? (
        <div className="grid gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="flex items-center bg-white p-4 rounded-lg shadow-md"
            >
              <img
                src={
                  product.productImage.startsWith("http")
                    ? product.productImage
                    : `${import.meta.env.VITE_BACKEND_URL}/${product.productImage}`
                }
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <div className="flex-1 ml-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-gray-600">
                  Price: Ksh {product.price}/{product.unit}
                </p>
                <p className="text-gray-500 text-sm">
                  Category: {product.category}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/buyer-dashboard/product/${product._id}`}>
                  <Button className="bg-green-500 hover:bg-green-600">
                    View Product
                  </Button>
                </Link>
                <Button
                  onClick={() => removeFromWishlist(product._id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      )}
    </div>
  );
};

export default Wishlist;
