/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verifica se há uma mensagem respondida
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // Valida se é um vídeo
    if (!/video/.test(mime)) return conn.reply(m.chat, '*✨ Por favor, responda a um Vídeo para converter em GIF com áudio.*', m)
    
    await m.react('⏳')
    
    try {
        let media = await q.download()
        let caption = '*Aqui está o seu GIF! 🍬*'
        
        // Envia o vídeo com a propriedade gifPlayback ativa (torna-o um GIF com som)
        await conn.sendMessage(m.chat, { 
            video: media, 
            gifPlayback: true, 
            caption: caption 
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('*❌ Ocorreu um erro ao converter o vídeo.*')
    }
}

handler.help = ['togifaud']
handler.tags = ['transformador']
handler.group = true
handler.register = false // Removida a trava de registro
handler.command = ['togif', 'gifcomaudio', 'gifaudio']

export default handler