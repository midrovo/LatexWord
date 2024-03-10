const response = (res, code, data) => {
    res.status(code).json({
        error: false,
        data: data
    })
}

const responseError = (res, code, message) => {
    res.status(code).json({
        error: true,
        message: message
    })
}

module.exports = {
    response,
    responseError
}