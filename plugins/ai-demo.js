/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Comando livre para todos. Sem trava de registro.
    if (!text) return conn.reply(m.chat, `*┇┆🔍 Como posso te ajudar hoje,?*\n\nExemplo: *${usedPrefix + command} Como criar um império?*`, m)

    try {
        await m.react('🧠')

        // Usando uma API Gateway que já tem o Gemini 1.5 estável
        // Esta não depende da sua chave pessoal, então não tem erro 404
        const res = await axios.get(`https://api.vreden.my.id/api/gemini?query=${encodeURIComponent(text)}`)
        
        const data = res.data.result

        if (!data) throw new Error('Sem resposta')

        await conn.sendMessage(m.chat, { 
            text: `*✦ Gótica IA (Gemini 1.5) ✦*\n\n${data}\n\n*✧ Dev: Leandro Rocha*` 
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        console.error('Erro na AI:', err.message)
        
        // Plano B: API de contingência via Sandip (GPT-4)
        try {
            const backup = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(text)}`)
            const dataBackup = backup.data.answer
            
            await conn.sendMessage(m.chat, { 
                text: `*✦ Gótica IA (GPT-4) ✦*\n\n${dataBackup}\n\n*✧ Dev: Leandro Rocha*` 
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            await conn.reply(m.chat, `*┇┆⚠️ Erro:*, todas as inteligências estão em greve hoje. Tente em 1 minuto.`, m)
        }
    }
}

handler.help = ['demo', 'openai', 'gemini']
handler.command = ['demo', 'openai', 'goticaia']
handler.tags = ['ai']

export default handler