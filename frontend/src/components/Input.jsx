import { motion } from "framer-motion";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  error,
  label,
  required = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2";
  const errorStyles = error
    ? "border-red-500 focus:ring-red-300 focus:border-red-500"
    : "border-gray-300 focus:ring-green-500 focus:border-green-500";
  const disabledStyles = disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseStyles} ${errorStyles} ${disabledStyles} ${className}`}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
