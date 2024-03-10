const { Model, DataTypes } = require('sequelize')

const USER_TABLE = 'usuarios'

class Usuario extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: USER_TABLE,
            modelName: 'Usuario',
            timestamp: true
        }
    }
}

const UsuarioSchema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'name'
    },
    lastname: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'lastname'
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'email'
    },
    username: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'username'
    },
    password: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'password'
    }
}

module.exports = {
    Usuario,
    UsuarioSchema
}