const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


// profile info page route

router.route("/profile")
    .get(userController.profile);
    

router.route("/contactInfo")
    .get(userController.contactInfoPage);


router.route("/terms")
    .get(userController.termsPage);

router.route("/privacy")
    .get(userController.privacyPage);


//signUp form + signup
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));



// login form + login 
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);


// logout route

router.get("/logout", userController.logout);


module.exports = router;