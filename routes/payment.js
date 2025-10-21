const express = require("express");
const router = express.Router({ mergeParams: true });
const paymentController = require("../controllers/payments.js");

// Custom error handler for payment routes
const handlePaymentError = (err, req, res, next) => {
    console.error("Payment route error:", err);
    res.status(500).json({ success: false, message: err.message || "Payment processing failed" });
};

router.route("/create-order")
    .post(async (req, res, next) => {
        try {
            await paymentController.createOrder(req, res);
        } catch (err) {
            handlePaymentError(err, req, res, next);
        }
    });

router.route("/verify-payment")
    .post(async (req, res, next) => {
        try {
            await paymentController.verifyPayment(req, res);
        } catch (err) {
            handlePaymentError(err, req, res, next);
        }
    });

router.route("/payment-failed")
    .post(async (req, res, next) => {
        try {
            await paymentController.paymentFailed(req, res);
        } catch (err) {
            handlePaymentError(err, req, res, next);
        }
    });

router.route("/success")
    .get(async (req, res, next) => {
        try {
            await paymentController.paymentSuccess(req, res);
        } catch (err) {
            handlePaymentError(err, req, res, next);
        }
    });

module.exports = router;