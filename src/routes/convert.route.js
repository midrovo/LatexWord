const express = require('express')
const router = express.Router()
const controller = require('../controllers/convert.controller')
const fileUploadMiddleware = require('../utils/middleware/multer.middleware')

router.post('/upload', controller.upload)
router.get('/convert/:foldername', controller.convertFile)
router.get('/download/:foldername', controller.download)
router.get('/delete/:foldername', controller.deleteDir)
router.get('/error', controller.errorPage)

module.exports = router