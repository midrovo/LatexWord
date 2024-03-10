// Librerias
const fileUploadMiddleware = require('./utils/middleware/multer.middleware');
const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const { responseError } = require('./utils/response.util');

// Inicializancion express
dotenv.config();
const app = express()

const PORT = process.env.PORT

// Configuraciones
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// Middlewares
app.use(express.json())
app.use(fileUploadMiddleware())
app.use(express.static('public'))

// Rutas de acceso al servidor
app.use(require('./routes/index.route'))
app.use(require('./routes/usuario.route'))
app.use(require('./routes/convert.route'))

// Manejo de errores
app.use((error, req, res, next) => {
    const { status, message } = error
    responseError(res, status, message)
})

// Iniciar el servidor y escuchar en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})