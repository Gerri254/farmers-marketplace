import { useState, useEffect } from "react";
import { fetchAllUsers, fetchAllProducts, fetchCompletedOrders } from "../api"; // Include fetchCompletedOrders
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import Papa from "papaparse";
import Button from "../components/Button";
import { motion } from "framer-motion";

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]); // State for sales data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportType === "users") {
      setLoading(true);
      fetchAllUsers()
        .then((response) => {
          setUsers(response.data.users || []);
        })
        .catch(() => setError("Failed to fetch users."))
        .finally(() => setLoading(false));
    } else if (reportType === "products") {
      setLoading(true);
      fetchAllProducts()
        .then((response) => {
          setProducts(response.data.products || []);
        })
        .catch(() => setError("Failed to fetch products."))
        .finally(() => setLoading(false));
    } else if (reportType === "sales") {
      setLoading(true);
      fetchCompletedOrders() // Fetch completed orders for sales report
        .then((response) => {
          setSales(response.data.orders || []);
        })
        .catch(() => setError("Failed to fetch sales data."))
        .finally(() => setLoading(false));
    }
  }, [reportType]);

  const getReportData = () => {
    if (reportType === "users") {
      return users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "N/A",
        createdAt: new Date(user.createdAt).toLocaleString(),
      }));
    }
    if (reportType === "products") {
      return products.map((product) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      }));
    }
    if (reportType === "sales") {
      return sales.map((order) => ({
        orderId: order._id,
        date: new Date(order.createdAt).toLocaleString(),
        product: order.product.name,
        quantity: order.product.quantity,
        total: order.totalAmount,
      }));
    }
    return []; // Default case if no data found
  };

  const getTableHeaders = () => {
    if (reportType === "users")
      return ["ID", "Name", "Email", "Role", "Phone", "Created At"];
    if (reportType === "products")
      return ["ID", "Name", "Category", "Price", "Stock"];
    if (reportType === "sales")
      return ["Order ID", "Date", "Product", "Quantity", "Total (KES)"];
    return [];
  };

  const handleExportPDF = () => {
    const input = document.getElementById("report-content");
    input.style.backgroundColor = "#ffffff";

    domtoimage.toPng(input).then((dataUrl) => {
      const pdf = new jsPDF();
      pdf.addImage(dataUrl, "PNG", 10, 10, 190, 0);
      pdf.save(`${reportType}_report.pdf`);
    });
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(getReportData());
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SkeletonRow = () => (
    <tr>
      {getTableHeaders().map((_, i) => (
        <td key={i} className="border p-2"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      ))}
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
          <h1 className="text-2xl font-bold mb-4 text-violet-800">Reports & Analytics</h1>

          <select
            className="mt-4 p-2 border rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="sales">Sales Report</option>
            <option value="users">Users Report</option>
            <option value="products">Products Report</option>
          </select>
        </motion.div>

        <motion.div
          id="report-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-white p-4 shadow rounded-lg"
        >
          <h2 className="text-xl font-semibold capitalize">
            {reportType} Report
          </h2>

          <div className="overflow-x-auto">
            {loading ? (
              <table className="w-full mt-4 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {getTableHeaders().map((header, index) => (
                      <th key={index} className="border p-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <table className="w-full mt-4 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {getTableHeaders().map((header, index) => (
                      <th key={index} className="border p-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getReportData().map((item, index) => (
                    <tr key={index} className="border">
                      {Object.values(item).map((value, idx) => (
                        <td key={idx} className="border p-2">
                          {value || "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleExportPDF}
            className="bg-green-500 hover:bg-green-600"
          >
            Export as PDF
          </Button>
          <Button
            onClick={handleExportCSV}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Export as CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;