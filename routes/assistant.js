const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


const assistantController = require("../controllers/assistants.js");


// footer Pages Routes -

router.route("/help")
    .get(assistantController.help);


router.route("/assistant")
    .get(wrapAsync(assistantController.sidebarMessages));

router.route("/assistant/support")
    .post(wrapAsync(assistantController.support));

router.route("/assistant/support/newChat")
    .get(wrapAsync(assistantController.newChat));

// Delete a chat (only owner or guest session that created it)
router.route('/assistant/:id')
    .delete(wrapAsync(assistantController.deleteChat));

module.exports = router;