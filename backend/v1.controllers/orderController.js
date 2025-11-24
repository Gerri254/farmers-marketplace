const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const logger = require('../v1.utils/log');

class OrderController {
    async placeOrder(req, res) {
        try {
            const { buyerId } = req.body;

            if (!buyerId) {
                logger.warn("Place order attempt without buyerId.");
                return res.status(400).json({ message: "Buyer ID is required" });
            }

            logger.info(`Fetching cart for buyer: ${buyerId}`);
            const cart = await Cart.findOne({ buyerId }).select('products');

            if (!cart || cart.products.length === 0) {
                logger.warn(`Cart is empty for buyer: ${buyerId}`);
                return res.status(400).json({ message: "Cart Empty" });
            }

            // First, validate all products
            const productValidations = [];
            for (let item of cart.products) {
                logger.info(`Validating product ${item._id} for buyer: ${buyerId}`);
                const product = await Product.findOne({_id: item._id});

                if (!product) {
                    logger.error(`Product with ID ${item._id} not found for buyer: ${buyerId}`);
                    return res.status(404).json({ message: `Product with ID ${item._id} not found` });
                }

                if (product.stock < item.quantity) {
                    logger.warn(`Insufficient stock for ${product.name} (ID: ${item._id}), buyer: ${buyerId}`);
                    return res.status(400).json({ message: `Not enough stock for ${product.name}` });
                }

                productValidations.push({ product, item });
            }

            // If all validations pass, process the orders
            let orders = [];
            for (let { product, item } of productValidations) {
                // Reduce stock
                product.stock -= item.quantity;
                await product.save();
                logger.info(`Stock updated for product ${product._id}. Remaining stock: ${product.stock}`);

                // Create order
                const orderData = {
                    buyerId,
                    product: item,
                    totalAmount: product.price * item.quantity,
                    status: "Pending"
                };

                // Add matchId if product came from a match
                if (item.matchId) {
                    orderData.matchId = item.matchId;
                    logger.info(`Order linked to match ${item.matchId}`);
                }

                const order = new Order(orderData);

                await order.save();
                logger.info(`Order placed for product ${item._id}, buyer: ${buyerId}`);

                orders.push(order);
            }

            // Clear the cart
            await Cart.findOneAndUpdate({ buyerId }, { products: [] });
            logger.info(`Cart cleared for buyer: ${buyerId}`);

            res.status(201).json({ message: "Orders placed successfully", orders });

        } catch (error) {
            logger.error(`Error placing order for buyer: ${req.body.buyerId || 'unknown'} - ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);
    
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
    
            if (order.status !== "Pending") {
                return res.status(400).json({ message: "Only pending orders can be canceled" });
            }
    
            // Restore stock for the canceled product
            const product = await Product.findById(order.product._id);
            if (product) {
                product.stock += order.product.quantity; // Restore the stock
                await product.save();
            }
    
            order.status = "Cancelled";
            await order.save();
    
            res.json({ message: "Order canceled successfully", order });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
    
            if (!["Pending", "Completed", "Cancelled"].includes(status)) {
                return res.status(400).json({ message: "Invalid status update" });
            }
    
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
    
            order.status = status;
            await order.save();
    
            res.json({ message: `Order status updated to ${status}`, order });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async viewSales(req, res) {
        try {
            const { farmerId } = req.params;
    
            // Find all completed orders
            const orders = await Order.find({ status: "Completed" }).populate("product");
    
            let sales = [];
            let totalRevenue = 0;
    
            orders.forEach(order => {
                if (order.product.farmerId.toString() === farmerId) {
                    const product = order.product;
    
                    sales.push({
                        orderId: order._id,
                        productId: product._id,
                        productName: product.name,
                        quantitySold: product.quantity,
                        totalEarnings: product.quantity * product.price,
                        orderDate: order.createdAt,
                    });
    
                    totalRevenue += product.quantity * product.price;
                }
            });
    
            if (sales.length === 0) {
                return res.status(404).json({ message: "No sales found for this farmer" });
            }
    
            res.json({ totalRevenue, sales });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async orderCount(_, res) {
        try {
            logger.info("Fetching order counts...");
    
            // Get count of each order status
            const pendingCount = await Order.countDocuments({ status: "Pending" });
            const completedCount = await Order.countDocuments({ status: "Completed" });
            const confirmedCount = await Order.countDocuments({ status: "Confirmed" });
            const cancelledCount = await Order.countDocuments({ status: "Cancelled" });
    
            logger.info(`Order counts - Pending: ${pendingCount}, Completed: ${completedCount}, Confirmed: ${confirmedCount}, Cancelled: ${cancelledCount}`);
    
            res.json({
                pending: pendingCount,
                completed: completedCount,
                confirmed: confirmedCount,
                cancelled: cancelledCount
            });
    
        } catch (error) {
            logger.error(`Error fetching order counts: ${error.message}`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }    

    async viewAllOrders(req, res) {
        try {
            const { buyerId } = req.params;
            
            if (!buyerId) {
                logger.warn("View orders attempt without buyerId");
                return res.status(400).json({ message: "Buyer ID is required" });
            }
            
            logger.info(`Fetching all orders for buyer: ${buyerId}`);
            
            // Find all orders for this buyer
            const orders = await Order.find({ buyerId })
                .sort({ createdAt: -1 }); // Sort by newest first
            
            if (!orders || orders.length === 0) {
                logger.warn(`No orders found for buyer: ${buyerId}`);
                return res.status(404).json({ message: "No orders found for this buyer" });
            }
            
            logger.info(`Retrieved ${orders.length} orders for buyer: ${buyerId}`);
            
            res.status(200).json({
                totalOrders: orders.length,
                orders: orders
            });
            
        } catch (error) {
            logger.error(`Error retrieving orders for buyer: ${req.params.buyerId || 'unknown'} - ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
    
    async viewOrders(req, res) {
        try {
            const { farmerId } = req.params;
            
            if (!farmerId) {
                logger.warn("View orders attempt without farmerId");
                return res.status(400).json({ message: "Farmer ID is required" });
            }
            
            logger.info(`Fetching all orders for farmer: ${farmerId}`);
            
            // Find all orders and populate the product field
            const allOrders = await Order.find()
                .populate("product")
                .sort({ createdAt: -1 }); // Sort by newest first
            
            // Filter orders where the product's farmerId matches the provided farmerId
            const farmerOrders = allOrders.filter(order => 
                order.product && order.product.farmerId && 
                order.product.farmerId.toString() === farmerId
            );
            
            if (!farmerOrders || farmerOrders.length === 0) {
                logger.warn(`No orders found for farmer: ${farmerId}`);
                return res.status(404).json({ message: "No orders found for this farmer's products" });
            }
            
            logger.info(`Retrieved ${farmerOrders.length} orders for farmer: ${farmerId}`);
            
            res.status(200).json({
                totalOrders: farmerOrders.length,
                orders: farmerOrders
            });
        } catch (error) {
            logger.error(`Error retrieving orders for farmer: ${req.params.farmerId || 'unknown'} - ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async confirmOrder(req, res) {
        try {
            const { farmerId, orderId } = req.body;
            logger.info(`Farmer ${farmerId} is confirming order ${orderId}`);
    
            // Find the order
            const order = await Order.findById(orderId).populate("product");
    
            if (!order) {
                logger.warn(`Order ${orderId} not found.`);
                return res.status(404).json({ message: "Order not found" });
            }
    
            // Ensure the order belongs to the farmer
            if (!order.product || order.product.farmerId.toString() !== farmerId) {
                logger.warn(`Farmer ${farmerId} is unauthorized to confirm order ${orderId}`);
                return res.status(403).json({ message: "Unauthorized to confirm this order" });
            }
    
            // Update order status to 'Confirmed'
            order.status = "Confirmed";
            await order.save();
    
            logger.info(`Order ${orderId} confirmed by farmer ${farmerId}`);
            res.json({ message: "Order confirmed successfully", order });
    
        } catch (error) {
            logger.error(`Error confirming order ${orderId} by farmer ${farmerId}: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;
            logger.info(`Fetching order details for order ${orderId}`);
            const order = await Order.findById(orderId).populate("product");
            if (!order) {
                logger.warn(`Order ${orderId} not found.`);
                return res.status(404).json({ message: "Order not found" });
            }
            return res.json({ order });
        } catch (error) {
            logger.error(`Error fetching order details for order ${orderId}: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async viewCompletedOrders(_, res) {
        try {
            const orders = await Order.find({ status: "Completed" }).populate("product");
            const total = orders.reduce((acc, order) => acc + order.product.price, 0);
            logger.info(`Total: ${total}`);
            logger.info(`Completed orders: ${orders.length}`);
            return res.json({ orders, total , orderCount: orders.length });
        } catch(error) {
            logger.error(`Error fetching completed orders: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
