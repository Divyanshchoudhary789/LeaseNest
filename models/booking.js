const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },

    status: {
        type: String,
        enum: ["booked", "cancel"],
        default: "booked"
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date,
        required: true
    },

    totalRent: {
        type: Number,
        required: true
    },

    paymentStatus:{
        type: String,
        enum:["pending","paid", "failed","refunded"],
        default: "pending"
    },

    razorpayOrderId:{
        type: String
    },

    razorpayPaymentId:{
        type: String
    },

    razorpaySignature:{
        type: String
    },

    refundId:{
        type: String
    },

    refundedAt:{
        type: Date
    },

    bookedAt:{
        type: Date,
        default: Date.now
    }


});


const Booking = mongoose.model("Booking",bookingSchema);

module.exports = Booking;