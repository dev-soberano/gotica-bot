/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, command, text, usedPrefix }) => {
    // Para que serve: IA Llama para conversas.
    // Como usar: .llama <pergunta>
    // Público: Todos. Sem trava de registro.

    if (!text) return conn.reply(m.chat, `*┇┆🔍 O que você deseja perguntar para a Llama AI?*\n\nExemplo: *${usedPrefix + command} Como funciona um motor?*`, m)
    
    try {
        await m.react('🦙')
        
        // Usando uma API alternativa mais estável para evitar o erro de JSON
        let api = await fetch(`https://api.vreden.my.id/api/llama3?query=${encodeURIComponent(text)}`)
        let json = await api.json()
        
        // A estrutura dessa API costuma ser json.result ou json.data
        let responseMessage = json.result || json.data || json.response;

        if (!responseMessage) throw new Error('Resposta inválida')

        await conn.sendMessage(m.chat, {
            text: `*✦ Gótica IA (Llama) ✦*\n\n${responseMessage}\n\n*✧ Dev: Leandro Rocha*`
        }, { quoted: m });

        await m.react('✅')

    } catch (error) { 
        console.error('Erro na Llama:', error)
        await m.react('❌')
        
        // Plano B caso a Vreden também falhe, usamos um gateway público
        try {
            let backup = await fetch(`https://api.aggelos-007.xyz/llama?questions=${encodeURIComponent(text)}`)
            let resBackup = await backup.json()
            await conn.sendMessage(m.chat, { text: `*✦ Gótica IA (Llama) ✦*\n\n${resBackup.answer}\n\n*✧ Dev: Leandro Rocha*` }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await conn.reply(m.chat, `*┇┆⚠️ Erro:* Todas as rotas da Llama estão offline.`, m)
        }
    }
}

handler.help = ['llama']
handler.tags = ['ai']
handler.command = ['llama', 'meta']

export default handler