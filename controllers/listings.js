const Listing = require("../models/listing");
const Booking = require("../models/booking");
const axios = require("axios");
mapKey = process.env.MAP_KEY;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}


module.exports.createListing = async (req, res) => {
    console.log(req.body);
    const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(req.body.location)}&apiKey=${mapKey}`;

    let getCoordinates = async () => {
        let response = await axios.get(geocodingUrl);
        //console.log(response.data.features[0].geometry);
        return response;
    }

    let response = await getCoordinates();
    //console.log(response);

    //console.log(req.body);
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.data.features[0].geometry;
    //console.log(newListing.geometry);

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");



}


module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    //console.log(id);
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", }, }).populate("owner");
    //console.log(listing);

    const bookings = await Booking.find({ listing: listing._id });
    //console.log(bookings);

    let bookedDates = [];

    bookings.forEach((booking) => {
        let current = new Date(booking.checkIn);
        let end = new Date(booking.checkOut);
        while (current <= end) {
            bookedDates.push(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
        }
    });

    //console.log(bookedDates);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    } else {
        res.render("listings/show.ejs", { listing, bookedDates });
    }


}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    //console.log(listing);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    //console.log(listing.image.url);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250,c_fill");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
}


module.exports.updateListing = async (req, res) => {
    const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(req.body.location)}&apiKey=${mapKey}`;

    let getCoordinates = async () => {
        let response = await axios.get(geocodingUrl);
        //console.log(response.data.features[0].geometry);
        return response;
    }

    let response = await getCoordinates();
    //console.log(response);

    const { id } = req.params;
    //console.log(req.body);
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    updatedListing.geometry = response.data.features[0].geometry;

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename };
    }
    await updatedListing.save();
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
}


module.exports.renderSearchResults = async (req, res) => {
    //console.log(req.query);
    let SearchingLocation = req.query.location;
    //console.log(SearchingLocation);
    let allListings = await Listing.find({ location: { $regex: SearchingLocation, $options: "i" } });
    //console.log(listings);
    res.render("listings/search.ejs", { allListings });
}