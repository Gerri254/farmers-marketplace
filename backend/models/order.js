const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Confirmed", "Cancelled"],
        default: "Pending"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
