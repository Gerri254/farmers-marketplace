import { Link } from "react-router-dom";
import Button from "../components/Button";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative px-6 md:px-12"
      style={{ backgroundImage: "url('/images/farm-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center p-8 md:p-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
          Connecting Farmers and Buyers
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-4 font-medium">
          A modern marketplace for fresh, high-quality farm produce.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/register">
            <Button className="w-full">Get Started</Button>
          </Link>
          <Link to="/about">
            <Button className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300">Learn More</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;