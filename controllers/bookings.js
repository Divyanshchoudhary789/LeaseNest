const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const daysDiff = require("../utils/daysDiff.js");


module.exports.index = async (req, res) => {
    const { id } = req.params;
    const { daterange } = req.query;
    const dates = daterange.split("to");
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);

    let days = daysDiff(startDate, endDate);
    if (days == 0) {
        days = 1;
    }
    //console.log(days);

    let listing = await Listing.findById(id).populate("owner");
    res.render("bookings/booking.ejs", { listing, days, daterange, startDate, endDate });

}


// Create New Booking Route

module.exports.new = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, totalRent } = req.body;

    const listing = await Listing.findById(id).populate("owner");
    //console.log(listing);

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


