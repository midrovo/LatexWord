const multer = require('multer')
const path = require('path')
const { FileError } = require('../error.util')
const { crearDirectorio } = require('../directory.util')

const fileUploadMiddleware = () => {
    const storage = multer.diskStorage({
        destination: async (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
            const foldername = `${ file.fieldname }-${ uniqueSuffix }`

            const directory = await crearDirectorio(`input_${ foldername }`)

            req.uploadDirectory = foldername;
            
            cb(null, directory)
        },
        filename: (req, file, cb) => {
            const extension = `${path.extname(file.originalname)}`
            if(extension == '.zip' || extension == '.tex' || extension == '.docx') {
                cb(null, file.originalname)

            } else {
                cb(new FileError
                    (
                        'Formato de archivo no permitido, solo se aceptan documentos Word (.docx), LaTeX (.tex) y Zip (.zip)',
                        400
                    )
                );
            }
        }
    })

    return multer({ storage }).single('file')

}

module.exports =  fileUploadMiddleware