const formulario = document.getElementById('formulario')
const file = document.getElementById('file')
const label = document.getElementById('lbltext');
const check = document.getElementById('btn-modal')
const msgAlert = document.getElementById('msg-alert')
const titleText = document.getElementById('title-text')
const fileText = document.getElementById('file-text')
const ventanaConvertir = document.getElementById('ventana-convertir')
const convertir = document.getElementById('convertir')
const descargar = document.getElementById('descargar')
const regresar = document.getElementById('regresar')
const loading = document.getElementById('loading')
const aceptar = document.getElementById('aceptar')
const cancelar = document.getElementById('cancelar')
const cerrar = document.getElementById('cerrar-modal')

file.addEventListener('change', async () => {
    const files = file.files;

    formulario.style.display = 'none'
    loading.style.display = 'flex'

    if(files.length == 1) {
        const data = new FormData(formulario);
        const res = await uploadFile('/upload', data)

        const responseData = await res.json();

        loading.style.display = 'none'
        formulario.style.display = 'flex'

        messageAlert(responseData)
        
        formulario.reset()       

    }
})

convertir.addEventListener('click', async () => {

    titleText.textContent = 'Convirtiendo...'
    fileText.textContent = 'Espere unos segundos mientras LaTeXWord realiza este proceso.'
    convertir.innerHTML = '<div class="load"><div>'
    convertir.style.pointerEvents = 'none'

    const res = await getFile(convertir.dataset.id);
    const responseData = await res.json()

    if (res.status == 400) {
        console.log(responseData.message)
    }

    else {
        convertir.style.display = 'none'
        titleText.textContent = 'Conversión Exitosa'
        fileText.textContent = 'La conversión ha finalizado exitosamente puede descargar su documento.'
        descargar.style.display = 'flex'
        descargar.textContent = 'Descargar'
        descargar.dataset.id = responseData.data.foldername
    }
})

descargar.addEventListener('click', async () => {
    descargar.style.pointerEvents = 'none'
    const res = await getFile(`/download/${ descargar.dataset.id }`)
    const responseData = await res.blob()

    const url = window.URL.createObjectURL(responseData)

    const link = document.createElement('a')
    link.href = url
    link.download = 'LaTeXWord.zip'
    document.body.appendChild(link)
    link.click()

    descargar.style.display = 'none'
    regresar.style.display = 'flex'
    titleText.textContent = 'Descarga Exitosa'
    fileText.textContent = `Por favor, antes de visualizar los documentos, descomprima el archivo descargado.`

    regresar.addEventListener('click', async() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
    
        const response = await getFile(`/delete/${ descargar.dataset.id }`)
    
        const respuesta = await response.json()
        console.log(respuesta)
    })
})

const uploadFile = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: data
    })

    return response;
}

const deleteFile = async (url) => {
    await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
}

const getFile = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return response;
}

const messageAlert = (response) => {
    if(response.error) {
        check.checked = true;
        msgAlert.textContent = response.message;
    }

    if(response.data) {
        if(response.data.result.warning) {
            aceptar.textContent = 'Si'
            cancelar.style.display = 'block'
            check.checked = true;
            cerrar.onclick = evento => evento.preventDefault()
            const message = response.data.result.message.split('/').pop()
            msgAlert.innerHTML = `Ruta de archivo <strong>${ message }</strong> inválida o archivo no encontrado. ¿Continuar de todos modos?`
            
            aceptar.addEventListener('click', () => {
                messageConvert(response.data)
    
            })
    
            cancelar.addEventListener('click', async () => {
                await deleteFile('/deleteDirectory')
                location.reload()
            })
        }

        if(response.data.result.success) {
            messageConvert(response.data)
        }
    }
}

const messageConvert = (message) => {
    titleText.textContent = 'Carga Exitosa';
    fileText.innerHTML = `Su archivo <strong style="color: #2979ff;">${ message.file }</strong> se subió correctamente.`;
    convertir.textContent = 'Convertir'
    formulario.style.display = 'none'
    ventanaConvertir.style.display = 'block'

    const urlFolder = `/convert/${message.foldername}`;

    convertir.dataset.id = urlFolder;
}
