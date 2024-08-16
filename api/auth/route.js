const express = require("express")
const router = express.Router()
const { register, login, self, logout, authenticate } = require("./auth")
router.route("/register").post(register)
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/self").get(authenticate, self);
module.exports = router