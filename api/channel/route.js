const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { get, create, update, leave, add, remove } = require("./channel")
router.route("/get").get(authenticate, get)
router.route("/create").post(authenticate, create)
router.route("/update").post(authenticate, update)
router.route("/leave").post(authenticate, leave)
router.route("/add").post(authenticate, add)
router.route("/remove").post(authenticate, add)

module.exports = router 