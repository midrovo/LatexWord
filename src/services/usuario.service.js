const { models } = require('../libs/sequelize');
const { compare, encrypt } = require('../utils/bcrypt.util');
const { ClientError } = require('../utils/error.util');

class UsuarioService {
    constructor() {}

    async find() {
        const usuarios = await models.Usuario.findAll({
            attributes: ['username', 'name', 'lastname', 'email']
        });
        return usuarios;
    }

    async findUsername(username) {
        const usuario = await models.Usuario.findOne({
            attributes: ['id', 'username', 'password'],
            where: {
                username: username
            }
        })

        if(!usuario) throw new ClientError("el usuario no existe.", 400);
        return usuario
        
    }

    async comparePassword(username, password) {
        const usuario = await this.findUsername(username)
        const validUser = await compare(password, usuario.password)

        if(!validUser) throw new ClientError("la contraseña no coincide.", 400)

        const user = {
            id: usuario.id,
            username: usuario.username
        }

        return user
        
    }

    async findOne(id) {
        const usuario = await models.Usuario.findOne({
            attributes: ['username', 'name', 'lastname', 'email'],
            where: {
                id: id,
            }
        });
        if(!usuario) throw new ClientError("Id Invalido", 400);
        return usuario;
    }

    async create(user) {
        const password = user.password
        user.password = await encrypt(password)
        await models.Usuario.create(user);
    }

    async update(id, user) {
        const usuario = await this.findOne(id);
        const usuarioUpdate = await usuario.update(user)
        return usuarioUpdate;
    }

    async delete(id) {
        const usuario = await this.findOne(id)
        await usuario.destroy();
        return { deleted: true }
    }
}

module.exports = UsuarioService