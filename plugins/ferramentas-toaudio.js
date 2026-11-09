/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verifica se você está respondendo a um áudio ou se enviou um áudio junto com o comando
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/audio/.test(mime)) {
        return conn.reply(m.chat, `*Soberano, responda a um áudio (mensagem de voz) para converter em arquivo baixável.*`, m)
    }

    // Reação de processo
    await m.react('🔄')

    try {
        // Baixa a mídia do servidor do WhatsApp
        let media = await q.download()
        if (!media) throw '*❌ Não foi possível baixar o áudio.*'

        // Mostra que o bot está enviando um áudio
        await conn.sendPresenceUpdate('composing', m.chat)

        // Reenvia o áudio como arquivo (ptt: false e audio/mpeg)
        await conn.sendMessage(m.chat, { 
            audio: media, 
            mimetype: 'audio/mpeg', 
            ptt: false,
            fileName: `audio_convertido_${new Date().getTime()}.mp3`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('*❌ Ocorreu um erro ao converter o áudio.*')
    }
}

handler.help = ['toaudio']
handler.tags = ['ferramentas']
handler.command = ['toaudio', 'baixar', 'amarelo'] // Comandos para facilitar o uso
handler.group = false 
handler.register = false 

export default handler