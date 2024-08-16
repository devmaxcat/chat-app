const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { history, create } = require("./message")

router.route("/history").get(authenticate, history)
router.route("/create").post(authenticate, create)

module.exports = router 