const { Sequelize } = require('sequelize')
const { config } = require('../settings/setting')
const setupModel = require('../models/index')

const sequelize = new Sequelize(
    config.db_name,
    config.db_user,
    config.db_password,
    {
        host: config.db_host,
        port: config.db_port,
        dialect: 'postgres'
    }
);

sequelize.sync()
setupModel(sequelize);

module.exports = sequelize