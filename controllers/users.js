const Booking = require("../models/booking");
const Review = require("../models/review");
const User = require("../models/user");



module.exports.profile = async (req, res) => {
    let bookings = await Booking.find({ guest: req.user._id }).populate("listing").populate("owner");
    //console.log(bookings);
    let reviews = await Review.find({ author: req.user._id }).populate("author");
    //console.log(reviews);

    res.render("users/profile.ejs", { bookings, reviews });
}


module.exports.help = (req,res)=>{
    res.render("footerPages/help.ejs");
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