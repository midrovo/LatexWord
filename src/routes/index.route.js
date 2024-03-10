const express = require('express')
const router = express.Router()
const controller = require('../controllers/index.controller')

// Se definen las rutas principales (inicio de sesion, registro de usuario y sitio principal)
router.get('/', controller.index)
router.get('/index/:username', controller.userIndex)
router.get('/login', controller.login)
router.get('/register', controller.register)
router.get('/home/:username', controller.home)
router.get('/logout', controller.logout)

module.exports = router