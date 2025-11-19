import axios from "axios";
import Cookies from "js-cookie"; 

const API = axios.create({ baseURL: "http://localhost:3000" });

// Attach token from cookies
API.interceptors.request.use((req) => {
  const token = Cookies.get("token"); // Use cookies instead of localStorage
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// API calls

// Register
export const farmerRegister = (formData) => API.post("/api/v1/farmer/register", formData);
export const buyerRegister = (formData) => API.post("/api/v1/buyer/register", formData);

// Login
export const farmerLogin = (formData) => API.post("/api/v1/farmer/login", formData);
export const buyerLogin = (formData) => API.post("/api/v1/buyer/login", formData);

// Logout
export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("id");
  return API.delete("/api/v1/logout");
};

// Add product
export const addProduct = (formData) => API.post("/api/v1/farmer/addproduct", formData);

// Get all products
export const getProducts = (page, limit, search = "", category = "") =>
  API.get(`/api/v1/buyer/getproducts?page=${page}&limit=${limit}&search=${search}&category=${category}`);

// View details of a product
export const getProductDetails = (id) => {
  return API.get(`/api/v1/buyer/viewdetails/${id}`);
}

// Profile

// view profile
export const viewBuyerProfile = (userID) => {
  return API.get(`/api/v1/buyer/viewprofile/${userID}`);
}
// edit profile
export const editBuyerProfile = (formData) => {
  return API.post(`/api/v1/buyer/editprofile/`, formData);
}

// view farmer profile
export const viewFarmerProfile = (userID) => {
  return API.get(`/api/v1/farmer/viewprofile/${userID}`);
}

// edit farmer profile
export const editFarmerProfile = (formData) => {
  return API.post(`/api/v1/farmer/editprofile/`, formData);
}

// View products by farmer
export const getFarmerProducts = () => {
  const farmerId = Cookies.get("id");
  return API.get(`/api/v1/farmer/myproducts/${farmerId}`);
}

// View farmer profile by buyer
export const getFarmerProfile = (id) => {
  return API.get(`/api/v1/buyer/viewfarmer/${id}`);
}

// Delete product
export const deleteProduct = (id) => {
  if (!id) {
    console.error("Error: No product ID provided to deleteProduct");
    return Promise.reject(new Error("No product ID provided"));
  }
  return API.delete(`/api/v1/farmer/deleteproduct/${id}`);
}

// Update product
export const editProduct = (formData, id) => {
  return API.post(`/api/v1/farmer/updateproduct/${id}`, formData);
}

// Cart

// Buyer add to cart
export const pushToCart = (product) => {
  return API.post("/api/v1/buyer/cart", product);
}

// Buyer view cart
export const viewCart = () => {
  const buyerId = Cookies.get("id");
  return API.get(`/api/v1/buyer/cart/${buyerId}`);
}

// delete from cart
export const removeFromCart = (productId) => {
  const buyerId = Cookies.get("id");
  return API.delete("/api/v1/buyer/removefromcart", {
    data: { buyerId, productId },
  });
};


// update cart
export const updateCart = (product) => {
  const buyerId = Cookies.get("id");
  return API.post("/api/v1/buyer/cart", {buyerId, product} );
};

// confirm order
export const confirmOrder = () => {
  const buyerId = Cookies.get("id");
  return API.post("/api/v1/buyer/placeorder", { buyerId });
};

// Cancel order
export const cancelOrder = (orderId) => {
  return API.post(`/api/v1/buyer/cancelorder/${orderId}`);
}

// Fetch orders buyer:
export const fetchOrders = () => {
  const buyerId = Cookies.get("id");
  return API.get(`/api/v1/buyer/vieworders/${buyerId}`);
};

// Fetch orders farmer:
export const fetchFarmerOrders = () => {
  const farmerId = Cookies.get("id");
  return API.get(`/api/v1/farmer/vieworders/${farmerId}`);
};

// Confirm Order farmer:
export const confirmOrders = (id) => {
  const farmerId = Cookies.get("id");
  return API.post("/api/v1/farmer/confirmorders/", { farmerId, orderId: id });
};

// Fetch order details:
export const fetchOrderDetails = (orderId) => {
  return API.get(`/api/v1/buyer/orderdetails/${orderId}`);
};

// Process payment:
export const processPayment = (orderId, paymentMethod) => {
  return API.post("/api/v1/buyer/processpayment/", { orderId, paymentMethod });
};

// AI Recommendations
export const requestRecommendation = () => {
  const farmerId = Cookies.get("id");
  return API.post("/api/v1/farmer/request-recommendation", { farmerId });
};

export const getRecommendations = () => {
  const farmerId = Cookies.get("id");
  return API.get(`/api/v1/farmer/recommendations/${farmerId}`);
};

export const getRecommendationDetails = (id) => {
  return API.get(`/api/v1/farmer/recommendation/${id}`);
};

export const respondToRecommendation = (id, response) => {
  return API.post("/api/v1/farmer/respond-to-recommendation", {
    recommendationId: id,
    response
  });
};

export const getRecommendationStats = () => {
  const farmerId = Cookies.get("id");
  return API.get(`/api/v1/farmer/recommendation-stats/${farmerId}`);
};

export const updateFarmProfile = (farmData) => {
  const farmerId = Cookies.get("id");
  return API.post("/api/v1/farmer/update-farm-profile", { farmerId, ...farmData });
};

// Matching System
export const generateFarmerMatches = () => {
  return API.post("/api/v1/matching/farmer/generate");
};

export const getFarmerMatches = () => {
  return API.get("/api/v1/matching/farmer/matches");
};

export const generateBuyerMatches = () => {
  return API.post("/api/v1/matching/buyer/generate");
};

export const getBuyerMatches = () => {
  return API.get("/api/v1/matching/buyer/matches");
};

export const respondToMatch = (matchId, response, role) => {
  const endpoint = role === "farmer"
    ? `/api/v1/matching/farmer/respond/${matchId}`
    : `/api/v1/matching/buyer/respond/${matchId}`;
  return API.post(endpoint, { response });
};

export const getMatchDetails = (matchId) => {
  return API.get(`/api/v1/matching/details/${matchId}`);
};

export const getMatchStats = () => {
  return API.get("/api/v1/matching/stats");
};
