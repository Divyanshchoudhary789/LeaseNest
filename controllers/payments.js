const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createOrder = async (req, res) => {
    //console.log("Request body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: "Request body is empty" });
    }

    const { listingId, userId, startDate, endDate, totalAmount } = req.body;

    if (!listingId || !userId || !startDate || !endDate || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${[
                !listingId && 'listingId',
                !userId && 'userId',
                !startDate && 'startDate',
                !endDate && 'endDate',
                !totalAmount && 'totalAmount'
            ].filter(Boolean).join(', ')}`
        });
    }

    try {
        const listing = await Listing.findById(listingId).populate("owner");

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        if (!listing.owner) {
            return res.status(404).json({ success: false, message: "Listing owner not found" });
        }

        // Server-side amount calculation for security
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = require("../utils/daysDiff.js");
        let days = daysDiff(start, end);
        if (days == 0) {
            days = 1;
        }

        const monthPrice = listing.price;
        const dayPrice = Math.round((monthPrice / 30) * 100) / 100;
        const calculatedRent = Math.ceil(days * dayPrice);
        const calculatedTax = Math.ceil((calculatedRent * 10) / 100);
        const calculatedTotal = calculatedRent + calculatedTax;

        // Verify client amount matches server calculation
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: "Amount validation failed. Please refresh and try again."
            });
        }

        const order = await razorpay.orders.create({
            amount: calculatedTotal * 100, // Use server-calculated amount
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Store booking data in session instead of creating booking
        req.session.pendingBooking = {
            listingId,
            userId,
            startDate,
            endDate,
            totalAmount: calculatedTotal,
            razorpayOrderId: order.id,
            listingOwner: listing.owner._id
        };

        return res.json({ success: true, order, orderId: order.id });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports.verifyPayment = async (req, res) => {
    const {razorpayOrderId, razorpayPaymentId, razorpaySignature} = req.body;

    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

    if(generatedSignature === razorpaySignature){
        try{
            // Get booking data from session
            const pendingBooking = req.session.pendingBooking;
            if (!pendingBooking || pendingBooking.razorpayOrderId !== razorpayOrderId) {
                return res.status(400).json({success:false,message:"Invalid session data"});
            }

            // Create booking only after successful payment
            const booking = new Booking({
                owner: pendingBooking.listingOwner,
                guest: pendingBooking.userId,
                listing: pendingBooking.listingId,
                checkIn: pendingBooking.startDate,
                checkOut: pendingBooking.endDate,
                totalRent: pendingBooking.totalAmount,
                paymentStatus: "paid",
                razorpayOrderId: pendingBooking.razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });

            await booking.save();

            // Clear session data
            delete req.session.pendingBooking;

            return res.json({success:true});
        } catch (err){
            console.error("Error creating booking:", err);
            return res.status(500).json({success:false,message:"Booking creation failed"});
        }
    } else {
        // Clear session data on failed payment
        delete req.session.pendingBooking;
        return res.status(400).json({success:false,message:"Invalid Payment Signature"});
    }
};


module.exports.paymentFailed = async (req, res) => {
    // Clear session data on payment failure
    delete req.session.pendingBooking;
    res.json({ success: true });
};


module.exports.paymentSuccess = async (req, res) => {
    req.flash("success", "Booking Successful, Enjoy your Stay!");
    res.redirect("/profile");
};