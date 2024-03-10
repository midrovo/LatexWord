const expresionRegular = (resultCommand, regexp) => {
    const frase = resultCommand.match(new RegExp(regexp))
    const result = frase[0].split(' ')[1]
    let resultFinal = ''

    for(const i in result) {
        if(result[i] != "'" && result[i] != "`") {
            resultFinal = resultFinal + result[i];
        }
    }

    return resultFinal
}

module.exports = { expresionRegular }