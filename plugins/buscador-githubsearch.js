/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*🚩 Soberano, por favor insira o nome de um repositório.*\n\n*Exemplo:* ${usedPrefix + command} Gotica-Bot`, m)

    const formatDate = (n, locale = 'pt-BR') => {
        const d = new Date(n)
        return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    try {
        await m.react('🔍')
        const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (!json.items || json.items.length === 0) throw 'Nenhum resultado encontrado'
        
        const results = json.items.slice(0, 5)
        let str = results.map((repo, index) => {
            return `
┌͡╼᮫͜  ⟆ 📂 *Resultado ${1 + index}*
┆ 👑 *Criador:* ${repo.owner.login}
┆ 📦 *Nome:* ${repo.name}
┆ 📅 *Criado:* ${formatDate(repo.created_at)}
┆ 💥 *Atualizado:* ${formatDate(repo.updated_at)}
┆ 👀 *Visitas:* ${repo.watchers}
┆ 🌟 *Estrelas:* ${repo.stargazers_count}
┆ 🍂 *Forks:* ${repo.forks}
┆ 📝 *Descrição:* ${repo.description ? repo.description : 'Sem Descrição'}
┆ 🔗 *Link:* ${repo.html_url}
┆ 📥 *Clone:* ${repo.clone_url}
└͡╼᮫͜ ───────────────────
`.trim()
        }).join('\n\n')

        let img = json.items[0].owner.avatar_url
        let txtHeader = `🐾 *G Ó T I C A  B O T  -  G I T H U B*\n\n${str}\n\n✨ *Busca Finalizada com Sucesso!*`

        await conn.sendMessage(m.chat, {
            text: txtHeader,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363405588045392@newsletter',
                    newsletterName: '🐾 Gótica Bot Oficial 🐾',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: 'GitHub Search - Gótica Bot',
                    body: 'Soberano: Leandro',
                    thumbnailUrl: img,
                    sourceUrl: 'https://chat.whatsapp.com/HhIATn48XsuAbduwn8sowT',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        conn.reply(m.chat, `*🚩 Não foram encontrados resultados para:* ${text}`, m)
    }
}

handler.help = ['githubsearch']
handler.tags = ['buscador']
handler.command = ['githubsearch', 'github', 'gitsearch']

// Sem trava de registro
handler.register = false

// Cooldown zero para o soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000)

export default handler