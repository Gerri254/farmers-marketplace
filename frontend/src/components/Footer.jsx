const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 p-6 w-full shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm md:text-base text-center md:text-left">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold text-green-500">AgriLink</span>. All rights
          reserved.
        </p>

        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-green-500 transition duration-300">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-green-500 transition duration-300">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;