/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import JavaScriptObfuscator from 'javascript-obfuscator'

const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, usedPrefix, command }) => {
    // VERIFICAÇÃO DE SOBERANIA: Apenas Leandro pode usar
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)
    
    if (!eDono) {
        return m.reply('*❌ COMANDO RESTRITO:* Este é um comando de nível supremo destinado apenas ao meu criador.')
    }

    if (!m.quoted || !m.quoted.text) 
        return m.reply(`*🔐 SOBERANO, RESPONDA AO CÓDIGO JS QUE DESEJA PROTEGER.*`)

    let code = m.quoted.text.trim()
    if (!code) return m.reply('*❌ ERRO:* O código está vazio.')

    await m.react('🔐')

    try {
        let obfuscated = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 1,
            splitStrings: true,
            splitStringsChunkLength: 5,
            renameGlobals: true,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            unicodeEscapeSequence: true
        }).getObfuscatedCode()

        if (obfuscated.length > 4000) {
            return conn.sendMessage(m.chat, { 
                document: Buffer.from(obfuscated), 
                mimetype: 'text/javascript', 
                fileName: 'codigo-protegido.js',
                caption: `*✅ PROTEÇÃO CONCLUÍDA, SOBERANO!*`
            }, { quoted: m })
        }

        m.reply('*✅ CÓDIGO PROTEGIDO:* \n\n' + '```' + obfuscated + '```')
        await m.react('🛡️')

    } catch (e) {
        console.error(e)
        m.reply(`*❌ ERRO:* Falha na proteção do script.`)
    }
}

handler.help = ['ofuscar']
handler.tags = ['owner'] // Alterado para a aba de dono
handler.command = ['ofuscar', 'obfuscate']
handler.owner = true // Trava nativa para o dono
handler.register = false 

export default handler