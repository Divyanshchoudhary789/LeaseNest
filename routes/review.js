const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


// Reviews Routes

// Create Review Route

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));



// Delete Review Route --> if any review is deleted from its collection then it will also have to delete from the listing in which it is stored inside reviews array as a reference.

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));




module.exports = router;