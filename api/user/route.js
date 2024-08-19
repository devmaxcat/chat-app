const express = require("express")
const router = express.Router()
const { authenticate } = require("../auth/auth")
const { search} = require("./user")
router.route("/search").get(authenticate, search)

module.exports = router

