/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { downloadContentFromMessage } from "@whiskeysockets/baileys"

export async function before(m, { conn }) {
    if (!m.isGroup) return !1
    
    let chat = global.db.data.chats[m.chat]
    if (!chat || (!chat.antiver && !chat.antivisu) || chat.isBanned) return !1

    // Captura o wrapper da visualização única
    let isView = m.message?.viewOnceMessageV2 || m.message?.viewOnceMessage || m.msg?.viewOnceMessageV2 || m.msg?.viewOnceMessage

    if (isView) {
        console.log('🔔 [ANTIVISU] Alvo detectado! Iniciando extração para o Soberano Leandro...')

        try {
            // Pequeno intervalo para evitar conflito de buffer no Baileys
            await new Promise(resolve => setTimeout(resolve, 1500))

            let msg = isView.message
            let type = Object.keys(msg)[0]
            
            if (!/imageMessage|videoMessage/.test(type)) return !1

            // Download direto da stream
            let stream = await downloadContentFromMessage(
                msg[type], 
                type === 'imageMessage' ? 'image' : 'video'
            )
            
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            const caption = msg[type].caption ? msg[type].caption : ''
            const alertMsg = `📢 *REVELADO PELO SOBERANO*\n\n*Legenda:* ${caption}\n\n*Aqui nada fica oculto para o dev Leandro!* 🍷\n*Grupo oficial:* https://chat.whatsapp.com/HhIATn48XsuAbduwn8sowT`

            if (/video/.test(type)) {
                return conn.sendFile(m.chat, buffer, 'video.mp4', alertMsg, m)
            } else {
                return conn.sendFile(m.chat, buffer, 'foto.jpg', alertMsg, m)
            }

        } catch (e) {
            console.log(`❌ [ERRO] Ocorreu uma falha ao processar a mídia:`, e.message)
        }
    }
    return !1
}