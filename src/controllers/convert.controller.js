const util = require('../utils/directory.util')
const catchedAsync = require('../utils/catched.util');
const { response } = require('../utils/response.util');
const FileService = require('../services/file.service');
const ConvertService = require('../services/convert.service');
const fs = require('fs-extra');

const fileService = new FileService()
const convertService = new ConvertService()

const upload = async (req, res) => {
    const archivo = req.file;
    const ext = util.extension(archivo);

    const directory = `input_${ req.uploadDirectory }`;

    if(ext == '.docx') {
        const result = await convertService.docxToPdf(directory, directory)
        await convertService.docxToXML(directory, directory)

        response(res, 200, { file: archivo.filename, result, foldername: req.uploadDirectory })
    }

    if(ext == '.tex' || ext == '.zip' && await util.readZip(archivo.filename, directory)) {
        const result = await convertService.latexToPdf(directory, directory)
        response(res, 200, { file: archivo.filename, result, foldername: req.uploadDirectory })
    }

}

const convertFile = async (req, res) => {
    const namePath = req.params.foldername
    const inputFile = `input_${ namePath }`

    const tex = await fileService.findFileByExt(inputFile, 'tex')

    const outputFile = `output_${ namePath }`
    await util.crearDirectorio(outputFile)

    await fs.promises.mkdir(util.pathAbsolute(util.pathDirectory(outputFile), 'recursos-html'))

    await convertService.pdfToHTML(outputFile, inputFile)
    
    if(tex) {
        await convertService.pdfToDocx(outputFile, inputFile)
        await convertService.docxToXML(outputFile, outputFile)
    }

    await fileService.movePDF_XML(inputFile, outputFile)

    const html = await fileService.findFileByExt(outputFile, 'html')
    await fileService.fileUpdate(html, outputFile)
    await fileService.deleteFiles(outputFile)
    await fileService.renameFileCss(outputFile)
    await fileService.moveRecursos(outputFile)
    await fileService.copyTemplate('template', outputFile)

    response(res, 200, { message: 'Ok', foldername: namePath })
}

const download = async(req, res) => {
    const nameFolder = req.params.foldername
    const inputFile = `input_${ nameFolder }`
    const outputFile = `output_${ nameFolder }`
    const inputPath = util.pathDirectory(inputFile)
    const outputPath = util.pathDirectory(outputFile)

    await util.compressToZip(outputPath)
    await util.deleteDirectory(inputPath)

    const file = util.pathAbsolute(outputPath, 'LaTeXWord.zip')

    res.download(file)
}

const deleteDir = async (req, res) => {
    const nameFolder = req.params.foldername
    const outputFile = `output_${ nameFolder }`
    const outputPath = util.pathDirectory(outputFile)

    await util.deleteDirectory(outputPath)
    response(res, 200, { message: 'OK' })
}

const errorPage = (req, res) => {
    res.render('error')
}

module.exports = {
    upload: catchedAsync(upload),
    convertFile: catchedAsync(convertFile),
    deleteDir: catchedAsync(deleteDir),
    errorPage: catchedAsync(errorPage),
    download: catchedAsync(download)
}