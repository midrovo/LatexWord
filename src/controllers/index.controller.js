const index = (req, res) => {
    res.render('index', { url: '/login', message: 'INICIA SESION' })
}

const userIndex = (req, res) => {
    const param = req.params.username
    res.render('index', { url: `/home/${param}`, message: 'CONVERTIDOR' })
}

const login = (req, res) => {
    res.render('login')
}

const register = (req, res) => {
    res.render('register')
}

const home = (req, res) => {
    const username = req.params.username
    res.render('home', { urlIndex: `/index/${username}`, urlHome: `/home/${username}` })
}

const logout = (req, res) => {
    res.redirect('/login')
}

module.exports = {
    index,
    userIndex,
    login,
    register,
    home,
    logout
}