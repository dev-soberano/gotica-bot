/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {

    if (!text) return m.reply(`*✨ Qual anime deseja buscar, Soberano?*\n\n*Exemplo:* ${usedPrefix + command} Naruto`)

    try {
        await m.react('🔍')
        let res = await fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(text))
        if (!res.ok) throw '*❌ Ocorreu um erro ao buscar as informações.*'

        let json = await res.json()
        if (!json.data || json.data.length === 0) return m.reply('*❌ Anime não encontrado, meu mestre.*')

        // Pegando os dados do primeiro resultado
        let anime = json.data[0]
        let { episodes, title, title_japanese, url, type, score, members, status, synopsis, favorites, duration, rating } = anime
        
        let animeingfo = `*✨ Título:* ${title} (${title_japanese})
*🎞️ Episódios:* ${episodes || 'Em lançamento'}
*💫 Tipo:* ${type}
*🗂️ Estado:* ${status}
*⏱️ Duração:* ${duration}
*🔞 Classificação:* ${rating}
*🌟 Favoritos:* ${favorites}
*🧮 Nota:* ${score}
*👥 Membros:* ${members}
`
        // Usando m.chat e o objeto da mensagem para evitar erro de variável indefinida (fkontak)
        await conn.sendFile(m.chat, anime.images.jpg.image_url, 'anime.jpg', `✨ *I N F O - A N I M E* ✨\n\n` + animeingfo, m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('*❌ Erro ao processar a busca. Tente novamente mais tarde.*')
    }
}

handler.help = ['infoanime']
handler.tags = ['anime']
handler.group = false // Removida trava de grupo
handler.register = false // Removida trava de registro conforme seu pedido
handler.command = ['infoanime', 'animeinfo']

export default handler