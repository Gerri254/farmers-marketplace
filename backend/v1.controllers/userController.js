const User = require('../models/user');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../v1.utils/log');
const { log } = require('winston');

require('dotenv').config()

class UserController {
    async register(req, res) {
        try {
            const { name, email, role, farm, address, password, phone } = req.body;
            logger.info(`Registering user: ${email}`);

            if (role === "buyer" && farm) {
                logger.warn(`Registration failed for ${email}: Buyers cannot have farm details.`);
                return res.status(400).json({ message: "Buyers cannot have farm details." });
            }

            const user = new User({ name, email, role, farm, address, password, phone });
            await user.save();

            logger.info(`User registered successfully: ${email}`);
            res.status(201).json({ message: "user registered successfully"});
        } catch (error) {
            logger.error(`Error registering user: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        const { email, password, role } = req.body;
        try {
            logger.info(`Login attempt for: ${email}`);
            const user = await User.findOne({ email });

            if (!user) {
                logger.warn(`Login failed for ${email}: Invalid email`);
                return res.status(401).json({ message: "Invalid email" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                logger.warn(`Login failed for ${email}: Invalid password`);
                return res.status(401).json({ message: "Invalid password" });
            }

            if (user.role !== role) {
                logger.warn(`Login failed for ${email}: Invalid role`);
                return res.status(401).json({ message: "Invalid role"});
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
            logger.info(`User logged in successfully: ${email}`);
            res.status(201).json({ message: "Login successful", token, id: user._id});
        } catch (error)  {
            logger.error(`Error logging in user: ${email} - ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async logout(_ , res) {
        try {
            res.clearCookie('token');
            logger.info(`User logged out successfully`);
            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            logger.error(`Error during logout: ${error.message}`);
            res.status(500).json({ message: "An error occurred during logout" });
        }
    }

    async adminLogin(req, res) {
        try {
            const { email, password } = req.body;

            if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
                logger.warn(`Admin login failed for ${email}`);
                return res.status(401).json({ message: "Invalid admin credentials" });
            }

            const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET);
            logger.info(`Admin logged in successfully`);
            res.status(201).json({ message: "Admin logged in successfully", token });
        } catch(error) {
            logger.error(`Error during admin login: ${error.message}`);
            return res.status(500).json({ message: "An error occurred during admin login" });
        }
    }

    async allUsers(_, res) {
        try {
            logger.info(`Fetching all users`);
            const users = await User.find({});
            logger.info(`All users fetched successfully: ${users.length}`)
            res.status(200).json({users});
        } catch (error) {
            logger.error(`Error fetching all users: ${error.message}`);
            res.status(500).json({ message: "An error occurred while fetching the users" });
        }
    }

    async userCount(_, res) {
        try {
            logger.info(`Fetching user count`);
            const userCount = await User.countDocuments({});
            logger.info(`User count fetched successfully: ${userCount}`)
            res.status(200).json({userCount});
        } catch (error) {
            logger.error(`Error fetching user count: ${error.message}`);
            res.status(500).json({ message: "An error occurred while fetching the user count" });
        }
    }

    async deleteUser(req, res) {
        try {
            logger.info(`Deleting user: ${req.params.userId}`);
            const user = await User.findByIdAndDelete(req.params.userId);
            logger.info(`User deleted successfully: ${user.email}`);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            logger.error(`Error deleting user: ${error.message}`);
            res.status(500).json({ message: "An error occurred while deleting the user" });
        }
    }

    async editProfile(req, res) {
        const { id, name, email, farm, address, password, phone, buyerProfile } = req.body;

        try {
            logger.info(`Updating profile for user: ${id}`);
            const user = await User.findOne({_id: id});
            if (!user) {
                logger.warn(`Profile update failed: User not found (${id})`);
                return res.status(404).json({ message: "User not found" });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (password) user.password = password;

            if (user.role === "farmer") {
                if (farm) user.farm = farm;
            }

            if (user.role === "buyer") {
                if (address) user.address = address;

                // Update buyer profile fields
                if (buyerProfile) {
                    logger.info(`Buyer profile data received: ${JSON.stringify(buyerProfile)}`);

                    if (!user.buyerProfile) {
                        user.buyerProfile = {};
                    }

                    // Only update county if it has a value (not empty string)
                    if (buyerProfile.county !== undefined && buyerProfile.county !== "") {
                        logger.info(`Updating county to: ${buyerProfile.county}`);
                        user.buyerProfile.county = buyerProfile.county;
                    }

                    if (buyerProfile.businessName !== undefined) {
                        user.buyerProfile.businessName = buyerProfile.businessName;
                    }

                    if (buyerProfile.buyerType !== undefined && buyerProfile.buyerType !== "") {
                        logger.info(`Updating buyerType to: ${buyerProfile.buyerType}`);
                        user.buyerProfile.buyerType = buyerProfile.buyerType;
                    }

                    // Update preferences
                    if (buyerProfile.preferences) {
                        if (!user.buyerProfile.preferences) {
                            user.buyerProfile.preferences = {};
                        }
                        if (buyerProfile.preferences.preferredCrops !== undefined) {
                            user.buyerProfile.preferences.preferredCrops = buyerProfile.preferences.preferredCrops;
                        }
                    }

                    // Mark buyerProfile as modified to ensure Mongoose saves it
                    user.markModified('buyerProfile');
                }
            }

            await user.save();

            logger.info(`Profile updated successfully for user: ${id}`);
            res.status(200).json({ message: "Profile updated successfully", user });
        } catch (error) {
            logger.error(`Error updating profile for user: ${id} - ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    async viewFarmer(req, res) {
        const { farmerId } = req.params;

        try {
            logger.info(`Fetching farmer profile: ${farmerId}`);
            const farmer = await User.findOne({_id: farmerId}).select("name phone farm");
            console.log(farmer);

            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            logger.info(`Farmer profile retrieved successfully: ${farmerId}`);
            return res.status(200).json(farmer);
        } catch (error) {
            logger.error(`Error retrieving farmer profile: ${farmerId} - ${error.message}`);
            return res.status(500).json({ message: error.message })
        }
    }

    async viewProfile(req, res) {
        const { userId } = req.params;

        try {
            logger.info(`Fetching user profile: ${userId}`);
            const user = await User.findOne({_id: userId});

            if (!user) {
                logger.warn(`User profile not found: ${userId}`);
                return res.status(404).json({ message: `No user with id: ${userId}` });
            }

            logger.info(`User profile retrieved successfully: ${userId}`);
            return res.status(200).json({ message: "User profile successfully retrieved", user});
        } catch (error) {
            logger.error(`Error retrieving user profile: ${userId} - ${error.message}`);
            return res.status(500).json({ message: error.message })
        }
    }
}

module.exports =  new UserController();
