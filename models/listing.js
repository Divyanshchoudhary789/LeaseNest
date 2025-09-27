const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");



const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    image: {
        url: String,
        filename: String,
    },

    price: {
        type: Number,
        required: true
    },

    location: {
        type: String,
    },

    country: {
        type: String,
    },

    category: {
        type: String,
        enum: ["Mountains", "Forests", "Farms", "Domes", "Arctic", "Rooms", "Iconic Cities", "Camping", "Boats", "Trending", "Amazing Pools"],
    },

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },

    // Approach - 2
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    // Approach - 3
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });

    }

});






const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;