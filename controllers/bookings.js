const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const daysDiff = require("../utils/daysDiff.js");



module.exports.index = async (req, res) => {
    const { id } = req.params;
    const { daterange } = req.query;
    const currUser = req.user;

    const dates = daterange.split("to");
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);

    let days = daysDiff(startDate, endDate);
    if (days == 0) {
        days = 1;
    }
    //console.log(days);

    let listing = await Listing.findById(id).populate("owner");


    let monthPrice = listing.price;
    let dayPrice = Math.round((monthPrice / 30) * 100) / 100;
    let Rent = Math.ceil(days * dayPrice);
    let tax = Math.ceil((Rent * 10) / 100);
    let totalRent = Rent + tax;
    res.render("bookings/booking.ejs", { listing, days, daterange, startDate, endDate, monthPrice, dayPrice, Rent, tax, totalRent, currUser });

}


// Create New Booking Route

module.exports.new = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    let days = daysDiff(startDate, endDate);
    if (days == 0) {
        days = 1;
    }

    const listing = await Listing.findById(id).populate("owner");
    //console.log(listing);

    let monthPrice = listing.price;
    let dayPrice = Math.round((monthPrice / 30) * 100) / 100;
    let Rent = Math.ceil(days * dayPrice);
    let tax = Math.ceil((Rent * 10) / 100);
    let totalRent = Rent + tax;


    const newBooking = new Booking({
        owner: listing.owner,
        guest: req.user._id,
        listing: listing,
        status: "booked",
        checkIn: checkIn,
        checkOut: checkOut,
        totalRent: totalRent
    });

    await newBooking.save();
    req.flash("success", "Booking Successful, Enjoy your Stay!");
    res.redirect(`/listings/${id}`);

}


module.exports.cancel = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the booking
        const booking = await Booking.findById(id).populate('guest');

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/profile");
        }

        // Check if user is authorized (guest or owner)
        if (req.user._id.toString() !== booking.guest._id.toString() && req.user._id.toString() !== booking.owner.toString()) {
            req.flash("error", "You are not authorized to cancel this booking");
            return res.redirect("/profile");
        }

        // Check if booking is already cancelled
        if (booking.status === "cancel") {
            req.flash("error", "Booking is already cancelled");
            return res.redirect("/profile");
        }

        // Check if check-in date has passed (no refund if already checked in)
        const currentDate = new Date();
        const checkInDate = new Date(booking.checkIn);

        if (currentDate >= checkInDate) {
            req.flash("error", "Cannot cancel booking after check-in date");
            return res.redirect("/profile");
        }

        // Process refund if payment was made
        if (booking.paymentStatus === "paid" && booking.razorpayPaymentId) {
            const Razorpay = require("razorpay");
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            try {
                // Create refund
                const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
                    amount: booking.totalRent * 100, // Amount in paisa
                    speed: "normal" // or "optimum" for faster processing
                });

                // Update booking with refund details
                booking.status = "cancel";
                booking.paymentStatus = "refunded";
                booking.refundId = refund.id;
                booking.refundedAt = new Date();

                await booking.save();

                req.flash("success", "Booking cancelled successfully. Refund will be processed within 5-7 business days.");
            } catch (refundError) {
                console.error("Refund processing failed:", refundError);
                // Still cancel booking but mark refund as failed
                booking.status = "cancel";
                booking.paymentStatus = "refund_failed";
                await booking.save();

                req.flash("error", "Booking cancelled but refund processing failed. Please contact support.");
            }
        } else {
            // No payment made, just cancel
            booking.status = "cancel";
            booking.paymentStatus = "cancelled"; // No payment was made
            await booking.save();

            req.flash("success", "Booking cancelled successfully.");
        }

        res.redirect("/profile");

    } catch (error) {
        console.error("Error cancelling booking:", error);
        req.flash("error", "Failed to cancel booking. Please try again.");
        res.redirect("/profile");
    }
}

