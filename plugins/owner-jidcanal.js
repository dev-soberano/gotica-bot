/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║    ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

const monitorando = new Map()

let handler = async (m, { conn }) => {
    let chat = m.chat

    if (monitorando.has(chat)) {
        return m.reply('⏳ *O monitor já está ativo!* Encaminhe o post do canal AGORA (sem citar nada, só encaminhe direto).')
    }

    monitorando.set(chat, true)

    await m.reply(
        `🛰️ *Monitor de Canais Ativado!*\n\n` +
        `📥 Vá no canal e *encaminhe* (forward) qualquer post pra cá.\n` +
        `⚠️ *NÃO* responda/cite a mensagem — apenas encaminhe.\n\n` +
        `⏱️ _Aguardando (60s)..._`
    )

    const capturarNewsletter = async (upsert) => {
        if (upsert.type !== 'notify') return

        for (const msg of upsert.messages) {
            if (!msg.message || msg.key.remoteJid !== chat) continue

            const conteudo = msg.message
            const contextInfo =
                conteudo.extendedTextMessage?.contextInfo ||
                conteudo.imageMessage?.contextInfo ||
                conteudo.videoMessage?.contextInfo ||
                conteudo.audioMessage?.contextInfo ||
                conteudo.stickerMessage?.contextInfo ||
                conteudo.documentMessage?.contextInfo

            const newsletterData = contextInfo?.forwardedNewsletterMessageInfo

            if (newsletterData) {
                conn.ev.off('messages.upsert', capturarNewsletter)
                monitorando.delete(chat)

                let texto = `📢 *CANAL CAPTURADO!* 📢\n\n`
                texto += `🏷️ *Nome:* ${newsletterData.newsletterName || 'Oculto'}\n`
                texto += `🔑 *JID:* \`${newsletterData.newsletterJid}\`\n\n`
                texto += `_Dados extraídos com sucesso!_ 🫡`

                await conn.sendMessage(chat, { text: texto }, { quoted: msg })
                return
            }
        }
    }

    conn.ev.on('messages.upsert', capturarNewsletter)

    setTimeout(() => {
        if (monitorando.has(chat)) {
            conn.ev.off('messages.upsert', capturarNewsletter)
            monitorando.delete(chat)
            conn.sendMessage(chat, { text: '⏱️ *Tempo esgotado!* Monitor desativado.' }).catch(() => null)
        }
    }, 60000)
}

handler.help = ['canal']
handler.tags = ['tools']
handler.command = /^(canal|jidcanal)$/i

export default handler