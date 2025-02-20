const express = require("express")
const router = express.Router()
const { authenticate } = require('../auth/auth')
const { history, create } = require("./message")
const upload = require('../../multer-config');

router.route("/history").get(authenticate, history)
router.route("/create").post(authenticate, upload.any('media'), create, function(err) {
    if (err) {
        console.log(err)
    }
})

module.exports = router 