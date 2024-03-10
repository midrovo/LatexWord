const { deleteDirectory, pathDirectory, pathAbsolute } = require('../utils/directory.util')
const { SyntaxError } = require('../utils/error.util')
const { convertAsync } = require('../utils/promiseConvert.util')
const FileService = require('../services/file.service');

const fileService = new FileService()

class ConvertService {
    constructor() {}

    async latexToPdf(output, input) {
        try {
            const latex = await fileService.findFileByExt(input, 'tex')
            const destdir = pathDirectory(output)
            const command = `pdflatex -interaction=nonstopmode -output-directory="${ destdir }" "${ latex }"`    
            const result = await convertAsync(command)

            if(result.warning) {
                return result
            }

            return result

        } catch(error) {
            await deleteDirectory(pathDirectory(input))
            // SIEMPRE SE INDICA ERROR DE COMANDO, PERO EL ERROR NO ES ESE
            // ARROJA ERROR POR PROBLEMAS DE SINTAXIS DEL DOCUMENTO LATEX
            console.log("MESSAGE ERROR >>>>> " + error.message)
            throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
        }  
    }

    async pdfToDocx(output, input) {
        try {
            const pdf = await fileService.findFileByExt(input, 'pdf')
            const outputDir = pathDirectory(output)
            const destdir = pathAbsolute(outputDir, 'documento.docx')
            const command = `pdf2docx convert "${ pdf }" "${ destdir }"`
            const result = await convertAsync(command)

            return result

        } catch(error) {
            await deleteDirectory(pathDirectory(input))
            await deleteDirectory(pathDirectory(output))
            console.log(error.message)
            throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
        }
    }

    async docxToPdf(output, input) {
        try {
            const docx = await fileService.findFileByExt(input, 'docx')
            const destdir = pathDirectory(output)
            const command = `soffice --convert-to pdf:writer_pdf_Export "${ docx }" --outdir "${ destdir }"`

            const result = await convertAsync(command)

            return result

        } catch(error) {
            await deleteDirectory(pathDirectory(input))
            console.log(error.message)
            throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
        }
    }

    async pdfToHTML(output, input) {
        try {
            const pdf = await fileService.findFileByExt(input, 'pdf')
            const destdir = pathDirectory(output)
            const pdfPathWsl = pdf.replace('C:', '/mnt/c').replace(/\\/g, '/');
            const destDirWsl = destdir.replace('C:', '/mnt/c').replace(/\\/g, '/');
            const command = `wsl.exe pdf2htmlEX --zoom 2 --dest-dir "${ destDirWsl }" --bg-format png --embed-css 0 --embed-javascript 0 --embed-font 0 --embed-image 0 "${ pdfPathWsl }"`

            const result = await convertAsync(command)

            return result

        } catch(error) {
            await deleteDirectory(pathDirectory(input))
            await deleteDirectory(pathDirectory(output))
            console.log("MENSAJE DE ERROR >>> " + error.message)
            throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
        }
    }

    async docxToXML(output, input) {
        try {
            const docx = await fileService.findFileByExt(input, 'docx')
            const destdir = pathDirectory(output)
            const command = `soffice --headless --convert-to xml "${ docx }" --outdir "${ destdir }"`

            const result = await convertAsync(command)

            return result

        } catch(error) {
            await deleteDirectory(pathDirectory(input))
            console.log(error.message)
            throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
        }
    }

}

module.exports = ConvertService