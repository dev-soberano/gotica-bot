/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot - OWNER FLOODAR
 */

const pedidoPagamento = (texto, mentions = [], senderJid, groupJid) => {
    return {
        requestPaymentMessage: {
            currencyCodeIso4217: 'BRL',
            amount1000: '0',
            requestFrom: senderJid || 'nobody@s.whatsapp.net',
            noteMessage: { 
                extendedTextMessage: { 
                    text: texto,
                    contextInfo: {
                        mentionedJid: mentions,
                        statusJidList: [groupJid]
                    }
                } 
            },
            amount: { value: '0', offset: 1000, currencyCode: 'BRL' },
            expiryTimestamp: Math.floor(Date.now() / 1000) + 86400
        }
    }
}

let handler = async (m, { conn, isSoberano }) => {
    if (!isSoberano) return m.reply('༄ Đev Šoberano ×͜× | Apenas o meu mestre pode usar este comando.')
    if (!m.isGroup) return m.reply('༄ Đev Šoberano ×͜× | Este comando só pode ser usado em grupos.')

    try {
        const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}))
        const participants = groupMetadata.participants || []
        const groupMembers = participants.map(i => i.id || i.jid).filter(Boolean)

        const texto = `*⚜️ 𝙂𝙊𝙏𝙄𝘾𝘼 𝘽𝙊𝙏𝙎 ⚜️* 🏴 ⚔️\nhttps://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K\n\n⚠️ *Boa sorte pra apagar ai adm* 😜\n\n *⚜️ 𝙂𝙊𝙏𝙄𝘾𝘼 𝘽𝙊𝙏𝙎 ⚜️* 🏴 𝐃𝐎𝐌𝐈𝐍𝐀.`

        const paymentPayload = pedidoPagamento(texto, groupMembers, m.sender, m.chat)

        // Disparo idêntico ao protocolo de relay simples
        for (let i = 0; i < 2; i++) {
            await conn.relayMessage(m.chat, paymentPayload, {})
            await new Promise(r => setTimeout(r, 500))
        }

    } catch (e) {
        console.error('Erro no comando floodar:', e)
        await m.reply('Erro ao disparar a mensagem.')
    }
}

handler.command = /^floodar$/i

export default handler