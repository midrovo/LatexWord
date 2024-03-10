require('dotenv').config();
const path = require('path')

const config = {
    env: process.env.NODE_ENV || 'dev',
    port: process.env.PORT || 3000,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    db_port: process.env.DB_PORT,
}

module.exports = { config }