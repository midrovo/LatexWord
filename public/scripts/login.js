const formulario = document.getElementById('formulario')
const alerta = document.getElementById('msg-alert')
const msgAlert = document.getElementById('message')
const inputs = document.querySelectorAll('input')

formulario.addEventListener('submit', async(e) => {
    e.preventDefault()

    const username = document.getElementById('txtuser')
    const password = document.getElementById('txtpassword')

    const url = '/login'

    const data = {
        username: username.value,
        password: password.value
    }  

    document.activeElement.blur()

    const request = await sendRequest(url, data)
    await receiveResponse(request)

})

const sendRequest = async(url, data) => {
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
    if(responseData.error) {
        mostrarAlerta(responseData)

    } else {
        console.log(responseData.data.home)
        window.location.href = responseData.data.home 
    }     
}

const mostrarAlerta = (response) => {
    alerta.style.display = 'block'
    msgAlert.innerHTML = `Error de credenciales: ${response.message}`
}

inputs.forEach((input) => {
    input.addEventListener('click', () => {
        if(alerta.style.display === 'block') {
            alerta.style.display = 'none'
        }
    })
})