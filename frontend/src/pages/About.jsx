import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg mb-8"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            About AgriLink
          </h1>
          <p className="text-lg text-gray-600">
            AgriLink is a digital marketplace designed to connect farmers and
            buyers, making agricultural trade easier, faster, and more efficient.
            Our platform provides farmers with a space to showcase their products
            while giving buyers access to fresh produce directly from the source.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-lg mb-8"
        >
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600">
            Our goal is to empower local farmers by providing them with a platform
            to sell their products seamlessly. We aim to eliminate middlemen,
            ensuring fair prices for farmers while offering buyers quality
            products at competitive rates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-lg mb-8"
        >
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Why Choose Us?
          </h2>
          <ul className="list-disc pl-5 text-lg text-gray-600 space-y-2">
            <li>Direct access to farmers and fresh produce.</li>
            <li>Secure and seamless transactions.</li>
            <li>Easy-to-use platform for both farmers and buyers.</li>
            <li>Real-time order tracking and communication.</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Get Involved
          </h2>
          <p className="text-lg text-gray-600">
            Whether you're a farmer looking to expand your market or a buyer
            searching for quality products, AgriLink is here to serve you. Join
            us today and be a part of the agricultural revolution!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;