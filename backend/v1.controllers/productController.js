const Product = require('../models/product');
const fs = require("fs");
const path = require("path");
const logger = require('../v1.utils/log');

class ProductController {
    async addProduct(req, res) {
        try {
            const { name, category, description, price, stock, farmerId } = req.body;

            if (!req.file) {
                logger.warn("Product image is missing in request.");
                return res.status(400).json({ message: "Product image is required" });
            }

            const product = new Product({
                name,
                category,
                description,
                price,
                stock,
                farmerId,
                productImage: req.file.path,
                approved: true  // Auto-approve for development/testing
            });

            await product.save();

            logger.info(`New product added: ${name} (Category: ${category}, Price: ${price}, Stock: ${stock})`);

            res.status(201).json({ message: "Product created successfully", product });
        } catch(error) {
            logger.error(`Error adding product: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async listProducts(req, res) {
        try {
            const { farmerId } = req.params;
            logger.info(`Fetching products for farmerId: ${farmerId}`);

    
            // Fetch all products for the given farmerId
            const products = await Product.find({ farmerId }).sort({ createdAt: -1 });
    
            if (products.length === 0) {
                logger.warn(`No products found for farmerId: ${farmerId}`);
                return res.status(404).json({ message: "No products found for this farmer" });
            }

            logger.info(`Retrieved ${products.length} products for farmerId: ${farmerId}`);
    
            return res.json({
                message: "Products retrieval successful",
                products
            });
    
        } catch (error) {
            logger.error(`Error fetching products for farmerId ${req.params.farmerId}: ${error.message}`);
            return res.status(500).json({ message: error.message });
        }
    }
    
    async updateProduct(req, res) {
        const { id } = req.params;
        logger.info(`Received update request for productId: ${id}`);
        
        try {
            const { name, category, description, price, stock, farmerId } = req.body;

            const product = await Product.findById(id);
            if (!product) {
                logger.warn(`Product with ID ${id} not found`);
                return res.status(404).json({ message: "Product not found" });
            }

            logger.info(`Updating product ${id} with new details`);

            // Update product details
            if (name) product.name = name;
            if (category) product.category = category;
            if (description) product.description = description;
            if (price) product.price = price;
            if (stock) product.stock = stock;
            if (farmerId) product.farmerId = farmerId;
            if (req.file) product.productImage = req.file.path;

            await product.save();

            logger.info(`Product ${id} updated successfully`);

            res.status(200).json({ message: "Product updated successfully", product });
        } catch (error) {
            logger.error(`Error updating product ${id}: ${error.message}`);

            res.status(500).json({ message: error.message });
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        logger.info(`Received delete request for productId: ${id}`);

        try {
            const product = await Product.findById(id);
            
            if (!product) {
                logger.warn(`Product with ID ${id} not found`);
                return res.status(404).json({message: "Product not found"});
            }

            if (product.productImage) {
                const imagePath = path.join(__dirname, "../uploads", product.productImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    logger.info(`Deleted image file for product ${id}`);
                } else {
                    logger.warn(`Image file not found for product ${id}`);
                }
            }

            await Product.findByIdAndDelete(id);

            logger.info(`Product ${id} successfully deleted`);

            res.status(200).json({message: "Product successfully deleted"});
        } catch (error) {
            logger.error(`Error deleting product ${id}: ${error.message}`);
            res.status(500).json({ message: error.message});
        }
    }

    async getAllProducts(req, res) {
        try {
            // Extract query parameters with defaults
            const page = parseInt(req.query.page) || 1; // Default: Page 1
            const limit = parseInt(req.query.limit) || 10; // Default: 10 products per page
            const search = req.query.search || ""; // Product name search
            const category = req.query.category === "all" ? "" : req.query.category;// Category filter
            const skip = (page - 1) * limit;

            logger.info(`Fetching products - Page: ${page}, Limit: ${limit}, Search: '${search}', Category: '${category || "Any"}'`);

            let query = {
                name: { $regex: search, $options: "i" },
                approved: true, // Only 
            };
    
            if (category) query.category = category; // Add category filter if provided
    
            // Fetch total product count
            const totalProducts = await Product.countDocuments(query);
    
            // Fetch paginated products
            const products = await Product.find(query)
                .sort({ createdAt: -1 }) // Sort by latest added
                .skip(skip)
                .limit(limit);
    
            // If no products found
            if (products.length === 0) {
                logger.warn(`No products found for query - Search: '${search}', Category: '${category || "Any"}'`);
                return res.status(404).json({ message: "No products found" });
            }

            logger.info(`Products retrieved successfully - Page ${page}, Found: ${products.length}/${totalProducts}`);
    
            res.json({
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                products
            });
        } catch (error) {
            logger.error(`Error fetching products: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async getAllProductsAdmin(req, res) {
        try {
            // Extract query parameters with defaults
            const page = parseInt(req.query.page) || 1; // Default: Page 1
            const limit = parseInt(req.query.limit) || 10; // Default: 10 products per page
            const search = req.query.search || ""; // Product name search
            const category = req.query.category === "all" ? "" : req.query.category;// Category filter
            const skip = (page - 1) * limit;

            logger.info(`Fetching products - Page: ${page}, Limit: ${limit}, Search: '${search}', Category: '${category || "Any"}'`);

            let query = {
                name: { $regex: search, $options: "i" }
            };
    
            if (category) query.category = category; // Add category filter if provided
    
            // Fetch total product count
            const totalProducts = await Product.countDocuments(query);
    
            // Fetch paginated products
            const products = await Product.find(query)
                .sort({ createdAt: -1 }) // Sort by latest added
                .skip(skip)
                .limit(limit);
    
            // If no products found
            if (products.length === 0) {
                logger.warn(`No products found for query - Search: '${search}', Category: '${category || "Any"}'`);
                return res.status(404).json({ message: "No products found" });
            }

            logger.info(`Products retrieved successfully - Page ${page}, Found: ${products.length}/${totalProducts}`);
    
            res.json({
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                products
            });
        } catch (error) {
            logger.error(`Error fetching products: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
    

    async getProduct(req, res) {
        const { productId } = req.params;

        try {
            logger.info(`Fetching product with ID: ${productId}`);

            const product = await Product.findOne({_id: productId});

            if (!product) {
                logger.warn(`Product not found - ID: ${productId}`);
                return res.status(404).json({ message: `No product with id: ${productId}` });
            }

            logger.info(`Product retrieved successfully - ID: ${productId}`);

            return res.status(200).json({
                message: "Product found successfully",
                product
            });
        } catch (error) {
            logger.error(`Error fetching product - ID: ${productId}, Error: ${error.message}`);
            return res.status(500).json({ message: error.message });
        }
    }

    async productCount(_, res) {
        try {
            logger.info("Fetching product count");
            const count = await Product.countDocuments();
            logger.info(`Product count retrieved successfully - Count: ${count}`);
            res.status(200).json({ productCount: count });
        } catch (error) {
            logger.error(`Error fetching product count: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async approveProduct(req, res) {
        const { productId } = req.params;
        try {
            logger.info(`Approving product with ID: ${productId}`);
            const product = await Product.findById(productId);
            if (!product) {
                logger.warn(`Product not found - ID: ${productId}`);
                return res.status(404).json({ message: `No product with id: ${productId}` });
            }
            product.approved = true;
            await product.save();
            logger.info(`Product approved successfully - ID: ${productId}`);
            res.status(200).json({ message: `Product approved successfully - ID: ${productId}` });
        } catch (error) {
            logger.error(`Error approving product: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ProductController();