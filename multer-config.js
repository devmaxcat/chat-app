// multer-config.js
const MAX_SIZE_MB = 25
const multer = require('multer')
const storage = multer.memoryStorage()  // store image in memory
const upload = multer({storage:storage, limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 }}) 

module.exports = upload