/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { readdirSync, unlinkSync, existsSync } from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    const sessionPath = './session/'
    
    try {
        if (!existsSync(sessionPath)) {
            return m.reply('*Erro:* A pasta session não foi encontrada.')
        }

        const files = readdirSync(sessionPath)
        let cont = 0

        for (const file of files) {
            // Não deleta o arquivo principal da conexão (creds.json)
            if (file !== 'creds.json') {
                const filePath = path.join(sessionPath, file)
                
                // VERIFICAÇÃO DE SEGURANÇA: Só tenta apagar se o arquivo realmente existir
                if (existsSync(filePath)) {
                    unlinkSync(filePath)
                    cont++
                }
            }
        }

        await m.react('🧹')
        m.reply(`✅ *LIMPEZA CONCLUÍDA!*\n\nForam removidos *${cont}* arquivos de lixo da pasta session.\n\n> O arquivo *creds.json* foi mantido para evitar deslogar.`)

    } catch (err) {
        console.error(err)
        m.reply(`❌ *Erro durante a limpeza:* ${err.message}`)
    }
}

handler.help = ['delsession']
handler.tags = ['owner']
handler.command = ['delsession', 'limparsessao', 'ds']
handler.rowner = true

export default handler