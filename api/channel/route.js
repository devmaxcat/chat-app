const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { get, create } = require("./channel")
router.route("/get").get(authenticate, get)
router.route("/create").post(authenticate, create)

module.exports = router 