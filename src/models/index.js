const model = require('./usuario.model')

function setupModel(sequelize) {
    model.Usuario.init(model.UsuarioSchema, model.Usuario.config(sequelize))
}

module.exports = setupModel
