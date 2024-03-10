const catchedAsync = (funcion) => {
    return (req, res, next) => {
        funcion(req, res).catch((error) => next(error))
    }
}

module.exports = catchedAsync;