/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

let stdouts = []
export let isModified = false

/**
 * Inicia a captura dos logs do terminal
 * @param {Number} maxLength - Quantidade máxima de linhas guardadas
 */
export default (maxLength = 200) => {
    // Guarda a função original de escrita do terminal
    let oldWrite = process.stdout.write.bind(process.stdout)

    /** Desativa a captura e restaura o terminal original */
    const disable = () => {
        isModified = false
        return process.stdout.write = oldWrite
    }

    // Sobrescreve a escrita do sistema para salvar uma cópia nos nossos logs
    process.stdout.write = (chunk, encoding, callback) => {
        stdouts.push(Buffer.from(chunk, encoding))
        oldWrite(chunk, encoding, callback)
        
        // Remove o log mais antigo se passar do limite definido
        if (stdouts.length > maxLength) stdouts.shift()
    }

    isModified = true
    return { disable, isModified }
}

/** Retorna todos os logs capturados concatenados em um único Buffer */
export function logs() { 
    return Buffer.concat(stdouts) 
}