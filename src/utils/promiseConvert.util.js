const child_process = require('child_process')
const { expresionRegular } = require('./regexp.util')

const convertAsync = async (command) => {
    return await new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if(error && (!command.includes('pdflatex') || command.includes('pdflatex') && stdout.includes('LaTeX Error'))) {
                reject(error)
                return;
            }

            if(command.includes('pdflatex') && stdout.includes('LaTeX Warning: File')) {
                const result = expresionRegular(stdout, '\\bFile(.)*\\bfound')
    
                resolve({ warning: true, message: result })
            }
    
            else {
                resolve({ success: true, message: 'complete' })
            }
        })
    })
}

module.exports = { convertAsync }