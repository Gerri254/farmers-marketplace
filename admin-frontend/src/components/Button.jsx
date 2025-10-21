import { motion } from 'framer-motion';

const Button = ({ children, onClick, className, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-4 font-bold text-white bg-violet-800 rounded-lg shadow-lg ${className}`}>
      {children}
    </motion.button>
  );
};

export default Button;
