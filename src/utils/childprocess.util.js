const util = require('util')
const child_process = require('child_process')
const exec = util.promisify(child_process.exec)
const { expresionRegular } = require('./regexp.util')
const { SyntaxError } = require('./error.util')

const execProcess = (command) => {
    child_process.exec(command, (error, stdout, stderr) => {
        if(error && !command.includes('pdflatex') || error && command.includes('pdflatex') && stdout.includes('LaTeX Error')) {
            return { failed: error }
        }

        if(command.includes('pdflatex') && stdout.includes('LaTeX Warning: File')) {
            const result = expresionRegular(stdout, '\\bFile(.)*\\bfound')

            return { warning: true, message: `Falta el siguiente archivo ${result}` }
        }

        else {
            return { success: true, message: 'complete' }
        }
    })
}

// const execProcess = async (command) => {
//     try {
//         const 
//     } catch(error) {
//         console.log(error.message)
//         throw new SyntaxError('El documento contiene errores de sintaxis. Verifique e intente de nuevo.', 400)
//     }
// }

module.exports = { execProcess }