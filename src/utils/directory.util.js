const path = require('path')
const fs = require('fs-extra')
const yauzl = require('yauzl-promise')
const AdmZip = require('adm-zip')
const { FileError } = require('./error.util')

const extension = (file) => {
    const ext = path.extname(file.originalname);
    return ext;
}

const crearDirectorio = async (foldername) => {
    const pathDir = pathDirectory(foldername)

    await fs.mkdir(pathDir)

    return pathDir
}

const readZip = async (file, folder) => {
    let isTex = ''
    const dirPath = pathDirectory(folder)
    const fileZip = await yauzl.open(path.join(dirPath, file))

    for await (const entry of fileZip) {
        const filename = entry.filename
        const ext = filename.split('.').pop();
        if(ext == 'tex') {
            isTex = ext;
        }
    }

    await fileZip.close();

    if(isTex == 'tex') {
       await extractZip(file, folder);
       return true;

    } else {
        await fs.promises.unlink(path.join(dirPath, file))
        throw new FileError('Solo se permiten archivos Zip que contengan documentos LaTeX (.tex)')
    }
}

const pathDirectory = (folder) => {
    return path.join(__dirname, '..', folder)
}

const pathAbsolute = (folder, file) => {
    return path.join(folder, file)
}

const pathFileName = (file) => {
    return path.parse(file).name
}

const extractZip = async (zip, folder) => {
    const dirPath = pathDirectory(folder)
    const zipFile = new AdmZip(path.join(dirPath, zip))
    zipFile.extractAllTo(dirPath, true)
    await fs.promises.unlink(path.join(dirPath, zip))
}

const compressToZip = async (pathdir) => {
    const zip = new AdmZip()
    zip.addLocalFolder(pathdir)

    const pathzip = pathAbsolute(pathdir, 'LaTeXWord.zip')
    zip.writeZip(pathzip)
}

const deleteDirectory = async (directory) => {
    await fs.remove(directory)
}

module.exports = {
    readZip,
    extension,
    crearDirectorio,
    pathDirectory,
    pathAbsolute,
    pathFileName,
    extractZip,
    compressToZip,
    deleteDirectory
}