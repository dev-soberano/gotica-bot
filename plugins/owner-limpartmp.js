/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { tmpdir } from 'os'
import path, { join } from 'path'
import { readdirSync, unlinkSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

// Pegando o diretório atual de forma segura no ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => { 

    await conn.reply(m.chat, '*🧹 Iniciando faxina nas pastas temporárias...*', m)

    try {
        // Agora definimos o caminho da pasta tmp do bot de forma absoluta
        // Estamos saindo de 'plugins' e indo para a raiz, depois para 'tmp'
        const pastaTmpBot = join(__dirname, '../tmp')
        const pastas = [tmpdir(), pastaTmpBot]
        let contador = 0

        pastas.forEach(diretorio => {
            if (existsSync(diretorio)) {
                const arquivos = readdirSync(diretorio)
                for (const arquivo of arquivos) {
                    const caminhoCompleto = join(diretorio, arquivo)
                    
                    // Proteção para não deletar arquivos importantes
                    if (arquivo === '.gitignore' || arquivo === 'readme.txt' || arquivo === 'placeholder') continue
                    
                    try {
                        unlinkSync(caminhoCompleto)
                        contador++
                    } catch (err) {
                        // Arquivos em uso pelo sistema ou permissão negada são ignorados
                        continue
                    }
                }
            }
        })

        return conn.reply(m.chat, `*✅ Faxina concluída, Soberano!*\n\n> *Arquivos removidos:* ${contador}\n> *Status:* Sistema leve. 💋`, m)

    } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '*❌ Ocorreu um erro durante a limpeza.*', m)
    }
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = ['deltmp', 'limpartmp', 'limparlixo']
handler.rowner = true 

export default handler