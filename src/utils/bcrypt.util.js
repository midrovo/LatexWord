const bcrypt = require('bcrypt')

const encrypt = async (textoPlano) => {
    const hash =  await bcrypt.hash(textoPlano, 10);
    return hash;
}

const compare = async (password, hashpassword) => {
    return await bcrypt.compare(password, hashpassword);
}

module.exports = { encrypt, compare }