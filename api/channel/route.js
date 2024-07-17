const express = require("express")
const router = express.Router()
const { get } = require("./channel")
router.route("/get").get(get)

module.exports = router 