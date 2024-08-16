const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { update, status } = require("./profile")
const upload = require('../../multer-config');

router.route("/update").post(authenticate, upload.single('icon'), update)
router.route("/status").post(authenticate, status)

module.exports = router