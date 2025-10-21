const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const bookingController = require("../controllers/bookings.js");


// get Booking Page

router.route("/listings/:id/booking")
    .get(wrapAsync(bookingController.index));

// create new booking
router.route("/listings/:id/booking/new")
    .post(isLoggedIn, wrapAsync(bookingController.new));


// cancel booking
router.route("/profile/booking/:id/cancel")
    .patch(wrapAsync(bookingController.cancel));

// show user bookings
// router.route("/profile/bookings")
//     .get(isLoggedIn, wrapAsync(bookingController.showUserBookings));


module.exports = router;