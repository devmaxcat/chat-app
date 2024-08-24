const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { get, create, respond, unfriend } = require("./friends")
router.route("/get").get(authenticate, get)
router.route("/create").post(authenticate, create)
router.route("/respond").post(authenticate, respond)
router.route("/unfriend").post(authenticate, unfriend)

module.exports = router