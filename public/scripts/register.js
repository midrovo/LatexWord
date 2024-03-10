const formulario = document.getElementById('formulario')
const txtemail = document.getElementById('txtemail')

formulario.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombres = document.getElementById('txtname')
    const apellidos = document.getElementById('txtlastname')
    const usuario = document.getElementById('txtuser')
    const email = document.getElementById('txtemail')
    const password = document.getElementById('txtpassword')

    const url = '/register'

    const data = {
        name: nombres.value,
        lastname: apellidos.value,
        username: usuario.value,
        email: email.value,
        password: password.value
    }

    document.activeElement.blur()

    const response = await sentRequest(url, data)
    await receiveResponse(response)

})

txtemail.addEventListener('blur', () => {
    if(!txtemail.validity.valid) {
        txtemail.value = ""
    }
})

const sentRequest = async(url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(data)
        })
    
        return response

    } catch(error) {
        console.log(error)
    }
}

const receiveResponse = async (response) => {
    formulario.reset()
    const responseData = await response.json()
    
    if(responseData.error == false) {
        window.location.href = responseData.data.login
    }  
}