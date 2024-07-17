const express = require("express")
const router = express.Router()
const { register, login, authenticate, logout } = require("./auth")
router.route("/register").post(register)
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/authenticate").get(authenticate);
module.exports = router