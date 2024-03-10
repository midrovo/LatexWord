const UsuarioService = require('../services/usuario.service');
const catchedAsync = require('../utils/catched.util');
const { response } = require('../utils/response.util');

const userService = new UsuarioService();

const addUsuario = async (req, res) => {
    const data = req.body
    await userService.create(data)
    response(res, 200, { login: `/login` })
}

const login = async (req, res) => {
    const data = req.body
    const usuario = await userService.comparePassword(data.username, data.password)
    response(res, 200, { home: `/home/${usuario.username}`, usuario })     
}

const getUsuarioById = async (req, res) => {
    const id = req.params.id
    const usuario = await userService.findOne(id)
    response(res, 200, usuario)
} 

const getUsuarioByName = async (req, res) => {
    const username = req.params.username
    const usuario = await userService.findUsername(username)
    response(res, 200, usuario)
} 

const getAllUsuarios = async (req, res) => {
    const usuarios = await userService.find();
    res.json(usuarios)
}

const updateUsuario = async (req, res) => {
    const id = req.params.id
    const data = req.body
    const usuario = await userService.update(id, data)
    res.json(usuario)
}

const deleteUsuario = async (req, res) => {
    const id = req.params.id
    const respuesta = await userService.delete(id)
    res.json(respuesta)
}

module.exports = {
    addUsuario: catchedAsync(addUsuario),
    login: catchedAsync(login),
    getUsuarioById: catchedAsync(getUsuarioById),
    getUsuarioByName: catchedAsync(getUsuarioByName),
    getAllUsuarios: catchedAsync(getAllUsuarios),
    updateUsuario: catchedAsync(updateUsuario),
    deleteUsuario: catchedAsync(deleteUsuario)
}