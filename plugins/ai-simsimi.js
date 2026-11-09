/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Se não tiver texto após o comando, ele ensina a usar
    if (!text) return m.reply(`*🦇 Hey Soberano!* Para conversar comigo, use:\n*${usedPrefix + command}* Olá!\n\n*Ou ligue o modo automático:* ${usedPrefix + command} on`)

    // Lógica de ligar/desligar (Salvando no DB)
    if (text === 'on' || text === 'off') {
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { simi: false }
        global.db.data.chats[m.chat].simi = (text === 'on')
        return m.reply(`*🦇 Status:* SimSimi agora está *${text === 'on' ? 'ATIVADO' : 'DESATIVADO'}* neste grupo.`)
    }

    // Se o usuário mandou um texto, ele responde agora mesmo (Modo conversa direta)
    try {
        await conn.sendMessage(m.chat, { react: { text: "💬", key: m.key }})
        const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=pt`)
        let resposta = res.data.success
        if (!resposta) throw 'erro'
        
        await m.reply(`💬 *𝗦𝗜𝗠𝗦𝗜𝗠𝗜:* ${resposta}`)
    } catch {
        m.reply('*🦇 Erro:* A API do SimSimi está fora do ar no momento. Tente novamente mais tarde.')
    }
}

handler.help = ['simi']
handler.tags = ['fun']
handler.command = ['simi', 'simsimi']
handler.register = false 

export default handler