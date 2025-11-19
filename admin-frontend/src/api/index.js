import axios from 'axios';
import Cookies from 'js-cookie';

const API = axios.create({ baseURL: "http://localhost:3000" });

// Attach token from cookies
API.interceptors.request.use((req) => {
  const token = Cookies.get("token"); 
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Login
export const Login = (FormData) =>{
  return API.post('api/v1/admin/login', FormData);
}

// Fetch all users
export const fetchAllUsers = () => {
  return API.get('/api/v1/admin/fetchusers');
}

// Fetch all products
export const fetchAllProducts = () => {
  return API.get('/api/v1/admin/getproducts');
}

// User count
export const fetchUserCount = () => {
  return API.get('/api/v1/admin/usercount');
}

// Order count
export const fetchOrderCount = () => {
  return API.get('/api/v1/admin/ordercount');
}

// Product count
export const fetchProductCount = () => {
  return API.get('/api/v1/admin/productcount');
}

// Completed orders
export const fetchCompletedOrders = () => {
  return API.get('/api/v1/admin/completedorders');
}

// Approve product
export const approveProduct = (productID) => {
  return API.post(`/api/v1/admin/approveproduct/${productID}`);
}