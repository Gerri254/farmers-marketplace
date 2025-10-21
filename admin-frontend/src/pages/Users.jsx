import { useState, useEffect } from "react";
import { fetchAllUsers } from "../api";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { motion } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "farmer", "buyer"

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAllUsers();
        setUsers(response.data.users || []);
      } catch (err) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  // Ensure correct filtering
  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  const SkeletonRow = () => (
    <tr>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
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
          <h1 className="text-2xl font-bold mb-4 text-violet-800">Manage Users</h1>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              className={`${filter === "all" ? "bg-violet-800" : "bg-gray-300 text-gray-800"}`}
              onClick={() => setFilter("all")}
            >
              All Users
            </Button>
            <Button
              className={`${filter === "farmer" ? "bg-green-500" : "bg-gray-300 text-gray-800"}`}
              onClick={() => setFilter("farmer")}
            >
              Farmers
            </Button>
            <Button
              className={`${filter === "buyer" ? "bg-yellow-500" : "bg-gray-300 text-gray-800"}`}
              onClick={() => setFilter("buyer")}
            >
              Buyers
            </Button>
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
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Role</th>
                    <th className="border p-2">Phone</th>
                    {/* Show different headers based on user type */}
                    {filter === "farmer" && (
                      <>
                        <th className="border p-2">Farm Name</th>
                        <th className="border p-2">Farm Location</th>
                      </>
                    )}
                    {filter === "buyer" && <th className="border p-2">Address</th>}
                    {filter === "all" && <th className="border p-2">Details</th>}
                    <th className="border p-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="text-center">
                        <td className="border p-2">{user._id}</td>
                        <td className="border p-2">{user.name}</td>
                        <td className="border p-2">{user.email}</td>
                        <td className="border p-2 capitalize">{user.role}</td>
                        <td className="border p-2">{user.phone || "N/A"}</td>
                        {/* Dynamic row values */}
                        {filter === "farmer" && (
                          <>
                            <td className="border p-2">
                              {user.farm?.farmName || "N/A"}
                            </td>
                            <td className="border p-2">
                              {user.farm?.location || "N/A"}
                            </td>
                          </>
                        )}
                        {filter === "buyer" && (
                          <td className="border p-2">{user.address || "N/A"}</td>
                        )}
                        {filter === "all" && (
                          <td className="border p-2">
                            {user.role === "farmer"
                              ? `${user.farm?.farmName || "N/A"} (${
                                  user.farm?.location || "N/A"
                                })`
                              : user.address || "N/A"}
                          </td>
                        )}
                        <td className="border p-2">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
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

export default Users;