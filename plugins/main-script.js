/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    try {
        // Buscando dados do seu repositório no GitHub
        let res = await fetch('https://api.github.com/repos/leandromemes/Gotica-Bot')

        if (!res.ok) throw new Error('Erro ao obter dados')
        let json = await res.json()

        let txt = `*乂  𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 𝐃𝐎 𝐒𝐂𝐑𝐈𝐏𝐓  乂*\n\n`
        txt += `*✰ Nome:* ${json.name}\n`
        txt += `*✰ Visitas:* ${json.watchers_count}\n`
        txt += `*✰ Tamanho:* ${(json.size / 1024).toFixed(2)} MB\n`
        txt += `*✰ Atualizado:* ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`
        txt += `*✰ URL:* ${json.html_url}\n`
        txt += `*✰ Forks:* ${json.forks_count}\n`
        txt += `*✰ Estrelas:* ${json.stargazers_count}\n\n`
        txt += `> *Dev: Leandro Rocha*`

        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363405588045392@newsletter',
                    newsletterName: '𝐆𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥'
                },
                externalAdReply: {
                    title: '𝐆𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭 𝐌𝐃',
                    body: '𝐃𝐞𝐯 𝐋𝐞𝐚𝐧𝐝𝐫𝐨',
                    thumbnailUrl: 'https://files.catbox.moe/th9d3p.jpeg',
                    sourceUrl: 'https://github.com/leandromemes',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        await conn.reply(m.chat, `*⚠︎* Ocorreu um erro ao buscar as informações do script.`, m)
    }
}

handler.help = ['script']
handler.tags = ['main']
handler.command = ['script', 'sc', 'repositorio']

export default handler