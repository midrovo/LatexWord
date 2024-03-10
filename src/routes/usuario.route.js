const express = require('express')
const router = express.Router()
const controller = require('../controllers/usuario.controller')

// Se definen las rutas para el proceso CRUD de usuario
router.get('/users', controller.getAllUsuarios)
router.get('/user/id/:id', controller.getUsuarioById)
router.get('/user/username/:username', controller.getUsuarioByName)
router.post('/register', controller.addUsuario)
router.post('/login', controller.login)
router.put('/update/:id', controller.updateUsuario)
router.delete('/delete/:id', controller.deleteUsuario)

module.exports = router