const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

// Constants for better maintainability
const PANEL_TYPES = {
    USER: 'user',
    HOST: 'host'
};

const VIEW_TYPES = {
    BOOKINGS: 'bookings',
    REVIEWS: 'reviews',
    LISTINGS: 'listings'
};

const SORT_OPTIONS = {
    RECENT: 'recent',
    OLD: 'old'
};

const PAYMENT_STATUSES = {
    ALL: 'all',
    PAID: 'paid',
    PENDING: 'pending',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};



module.exports.profile = async (req, res) => {
    try {
        // User Panel Data
        let bookings = await Booking.find({ guest: req.user._id }).populate("listing").populate("owner").populate("guest");
        let reviews = await Review.find({ author: req.user._id }).populate("author");

        // Host panel Data
        let listingsForHost = await Listing.find({ owner: req.user._id }).populate("owner").populate({ path: "reviews", populate: { path: "author" } });
        let bookingsForHost = await Booking.find({ owner: req.user._id }).populate("listing").populate("guest").populate("owner");

    // Advanced filtering and sorting logic
    const {
        searchBookings, sortBookings, paymentStatusBookings,
        searchReviews, sortReviews,
        searchListings, sortListings,
        searchHostBookings, sortHostBookings, paymentStatusHostBookings,
        userView: userViewQuery, hostView: hostViewQuery
    } = req.query;

    // Filter and sort bookings (user bookings)
    if (searchBookings) {
        bookings = bookings.filter(booking =>
            booking.listing.title.toLowerCase().includes(searchBookings.toLowerCase()) ||
            booking.owner.username.toLowerCase().includes(searchBookings.toLowerCase()) ||
            booking.listing.description.toLowerCase().includes(searchBookings.toLowerCase()) ||
            booking.listing.location.toLowerCase().includes(searchBookings.toLowerCase())
        );
    }

    if (paymentStatusBookings && paymentStatusBookings !== 'all') {
        bookings = bookings.filter(booking => booking.paymentStatus === paymentStatusBookings);
    }

    if (sortBookings === SORT_OPTIONS.RECENT) {
        bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    } else if (sortBookings === SORT_OPTIONS.OLD) {
        bookings.sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt));
    }

    // Filter and sort reviews
    if (searchReviews) {
        reviews = reviews.filter(review =>
            review.comment.toLowerCase().includes(searchReviews.toLowerCase()) ||
            review.rating.toString().includes(searchReviews) ||
            review.author.username.toLowerCase().includes(searchReviews.toLowerCase())
        );
    }

    if (sortReviews === SORT_OPTIONS.RECENT) {
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortReviews === SORT_OPTIONS.OLD) {
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Filter and sort host listings
    if (searchListings) {
        listingsForHost = listingsForHost.filter(listing =>
            listing.title.toLowerCase().includes(searchListings.toLowerCase()) ||
            listing.location.toLowerCase().includes(searchListings.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchListings.toLowerCase()) ||
            listing.category.toLowerCase().includes(searchListings.toLowerCase())
        );
    }

    if (sortListings === SORT_OPTIONS.RECENT) {
        listingsForHost.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    } else if (sortListings === SORT_OPTIONS.OLD) {
        listingsForHost.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
    }

    // Filter and sort host bookings
    if (searchHostBookings) {
        bookingsForHost = bookingsForHost.filter(booking =>
            booking.listing.title.toLowerCase().includes(searchHostBookings.toLowerCase()) ||
            booking.guest.username.toLowerCase().includes(searchHostBookings.toLowerCase()) ||
            booking.listing.description.toLowerCase().includes(searchHostBookings.toLowerCase()) ||
            booking.listing.location.toLowerCase().includes(searchHostBookings.toLowerCase())
        );
    }

    if (paymentStatusHostBookings && paymentStatusHostBookings !== 'all') {
        bookingsForHost = bookingsForHost.filter(booking => booking.paymentStatus === paymentStatusHostBookings);
    }

    if (sortHostBookings === SORT_OPTIONS.RECENT) {
        bookingsForHost.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    } else if (sortHostBookings === SORT_OPTIONS.OLD) {
        bookingsForHost.sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt));
    }

    let currentPanel = req.query.panel || 'user';
    let userViewParam = req.query.userView || 'bookings';
    let hostViewParam = req.query.hostView || 'listings';

    // Ensure we have valid panel state
    if (!currentPanel || (currentPanel !== PANEL_TYPES.USER && currentPanel !== PANEL_TYPES.HOST)) {
        currentPanel = PANEL_TYPES.USER;
    }
    if (!userViewParam || (userViewParam !== VIEW_TYPES.BOOKINGS && userViewParam !== VIEW_TYPES.REVIEWS)) {
        userViewParam = VIEW_TYPES.BOOKINGS;
    }
    if (!hostViewParam || (hostViewParam !== VIEW_TYPES.LISTINGS && hostViewParam !== VIEW_TYPES.BOOKINGS)) {
        hostViewParam = VIEW_TYPES.LISTINGS;
    }

    res.render("users/profile.ejs", {
        bookings,
        reviews,
        listingsForHost,
        bookingsForHost,
        searchBookings: req.query.searchBookings || '',
        sortBookings: req.query.sortBookings || '',
        paymentStatusBookings: req.query.paymentStatusBookings || '',
        searchReviews: req.query.searchReviews || '',
        sortReviews: req.query.sortReviews || '',
        searchListings: req.query.searchListings || '',
        sortListings: req.query.sortListings || '',
        searchHostBookings: req.query.searchHostBookings || '',
        sortHostBookings: req.query.sortHostBookings || '',
        paymentStatusHostBookings: req.query.paymentStatusHostBookings || '',
        currentPanel,
        userView: userViewParam,
        hostView: hostViewParam
    });
    } catch (error) {
        console.error('Error in profile controller:', error);
        req.flash('error', 'Something went wrong while loading your profile');
        res.redirect('/listings');
    }
};


module.exports.contactInfoPage = (req, res) => {
    res.render("footerPages/contactInfo.ejs");
}

module.exports.privacyPage = (req,res)=>{
    res.render("footerPages/privacy");
}


module.exports.termsPage = (req,res)=>{
    res.render("footerPages/terms.ejs");
}


module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
}


module.exports.signup = async (req, res) => {
    try {
        //console.log(req.body);
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        //console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to LeaseNest!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}


module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
}


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to LeaseNest!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
}