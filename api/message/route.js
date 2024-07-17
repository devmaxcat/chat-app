const express = require("express")
const router = express.Router()
const { history } = require("./message")
router.route("/history").get(history)

module.exports = router 