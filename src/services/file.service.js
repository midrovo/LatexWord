const { pathDirectory, pathAbsolute, pathFileName } = require("../utils/directory.util");
const fs = require('fs-extra')
const cheerio = require('cheerio');
const beautify = require('js-beautify').html;

class FileService {
    constructor() {}

    async findFileByExt(path, ext) {
        const pathDir = pathDirectory(path)
        const files = await fs.promises.readdir(pathDir)
        let file = ''

        for(const f of files) {
            if(f.split('.').pop() == ext) {
                file = f;
            }
        }

        if(file) {
            const fileAbsolute = pathAbsolute(pathDir, file)
            return fileAbsolute;
        }

        return false
    }

    async moveRecursos(output) {
        const outputDir = pathDirectory(output)
        const recursos = pathAbsolute(outputDir, 'recursos-html')
        const files = await fs.promises.readdir(outputDir)

        for(const f of files) {
            const pathOrigen = pathAbsolute(outputDir, f)
            const pathDest = pathAbsolute(recursos, f)

            if(f.includes('woff') || f.includes('png') || f.includes('css') || f.includes('index.js')) {
                await fs.promises.rename(pathOrigen, pathDest)
            }

        }
    }

    async movePDF_XML(origen, destino) {
        const origenDir = pathDirectory(origen)
        const destDir = pathDirectory(destino)
        const files = await fs.promises.readdir(origenDir)

        for(const f of files) {
            const pathOrigen = pathAbsolute(origenDir, f)
            const pathDest = pathAbsolute(destDir, f)

            if((f.includes('pdf') && !f.includes('converted-to.pdf')) || f.includes('xml')) {
                await fs.promises.rename(pathOrigen, pathDest)
            }
        }
    }

    async copyTemplate(template, recurso) {
        const origenDir = pathDirectory(template)
        const outputDir = pathDirectory(recurso)
        const destDir = pathAbsolute(outputDir, 'recursos-html')
        const files = await fs.promises.readdir(origenDir)

        for(const f of files) {
            const pathOrigen = pathAbsolute(origenDir, f)
            const pathDest = pathAbsolute(destDir, f)
            await fs.promises.copyFile(pathOrigen, pathDest)

        }
    }

    async renameFileCss(output) {
        const pathDir = pathDirectory(output)
        const files = await fs.promises.readdir(pathDir)

        for(const f of files) {
            if(f.includes('css')) {
                const pathFile = pathAbsolute(pathDir, f)
                const pathNewNameFile = pathAbsolute(pathDir, 'style-3.css')
                await fs.promises.rename(pathFile, pathNewNameFile)
            }
        }
    }

    async changeExtFile(path, ext, changeExt, output) {
        const pathDir = pathDirectory(path)
        const files = await fs.promises.readdir(pathDir)
        let file = ''

        for(const f of files) {
            if(f.split('.').pop() == ext) {
                file = `${pathFileName(f)}.${changeExt}`;
            }
        }

        const pathfinal = pathDirectory(output)
        const outputFile = pathAbsolute(pathfinal, file)

        return outputFile;
    }

    async deleteFiles(output) {
        const pathDir = pathDirectory(output)
        const files = await fs.promises.readdir(pathDir)

        for(const f of files) {
            if((f.includes('compatibility') || f.includes('base') || f.includes('pdf2html') || f.includes('fancy')) ||
            (f.includes('.html') && !f.includes('index.html'))) {
                await fs.promises.unlink(pathAbsolute(pathDir, f))
            }
            
        }

    }

    async fileUpdate(file, output) {
        const directory = pathDirectory(output)
        const html = await fs.readFile(file, 'utf8');
        const $ = cheerio.load(html);

        const pageContainerContent = $('#page-container').html();

        const plantilla = `
        <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="recursos-html/style-1.css"/>
            <link rel="stylesheet" href="recursos-html/style-2.css"/>
            <link rel="stylesheet" href="recursos-html/style-3.css"/>
            <script src="recursos-html/index.js"></script>
            <script>
                try{
                    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
                } catch(e) {}
            </script>
            <title></title>
        </head>
        <body>
            <div id="sidebar">
                <div id="outline"></div>
            </div>
            <div id="page-container">${ pageContainerContent }
            </div>
            <div class="loading-indicator">
                <img alt="" src="#"/>
            </div>
        </body>
        </html>
        `;
        
        const formatter = beautify(plantilla, { indent_size: 4 })

        const htmlModify = cheerio.load(formatter)

        htmlModify('img[src]').each((index, element) => {
            const src = htmlModify(element).attr('src');
            // Verifica si el src no comienza con 'http' o '//'
            if (!src.startsWith('http') && !src.startsWith('//')) {
                // Modifica el atributo 'src' del elemento
                htmlModify(element).attr('src', 'recursos-html/' + src);
            }
        });

        const index = pathAbsolute(directory, 'index.html')
        await fs.writeFile(index, htmlModify.html(), 'utf8');
    }
}

module.exports = FileService