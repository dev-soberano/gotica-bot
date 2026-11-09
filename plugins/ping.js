import os from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'

/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 */

let format = sizeFormatter({
    std: 'JEDEC', 
    decimalPlaces: 2,
    keepTrailingZeros: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
    // 1. Mensagem inicial de teste
    await m.reply('🚀 *Testando velocidade e integridade dos sistemas...*')

    // 2. O "delay" de 3 segundos que você pediu para dar realismo kkk
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 3. Cálculos de performance e sistema
    let start = performance.now()
    let end = performance.now()
    let latencia = (end - start).toFixed(4)
    
    let uptime = process.uptime() * 1000
    let muptime = clockString(uptime)
    
    // Informações da Máquina (Host)
    const chats = Object.keys(conn.chats || {}).length
    const users = Object.keys(global.db.data.users || {}).length
    const { totalmem, freemem } = os
    const usedMem = process.memoryUsage().rss
    const freeMemPerc = Math.round((freemem() / totalmem()) * 100)

    let info = `
🦇 *𝗚𝗢́𝗧𝗜𝗖𝗔 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦* 🦇
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
⏱️ *𝗟𝗮𝘁𝗲̂𝗻𝗰𝗶𝗮:* ${latencia} ms
⏳ *𝗨𝗽𝘁𝗶𝗺𝗲:* ${muptime}
📡 *𝗣𝗹𝗮𝘁𝗮𝗳𝗼𝗿𝗺𝗮:* ${os.platform()} (${os.release()})

📊 *𝗘𝗦𝗧𝗔𝗧𝗜́𝗦𝗧𝗜𝗖𝗔𝗦*
👥 *𝗨𝘀𝘂𝗮́𝗿𝗶𝗼𝘀:* ${users}
💬 *𝗖𝗵𝗮𝘁𝘀:* ${chats}
⚙️ *𝗡𝗼𝗱𝗲.𝗷𝘀:* ${process.version}

💻 *𝗛𝗔𝗥𝗗𝗪𝗔𝗥𝗘*
📟 *𝗥𝗔𝗠 𝗨𝘀𝗮𝗱𝗮:* ${format(usedMem)}
📟 *𝗥𝗔𝗠 𝗧𝗼𝘁𝗮𝗹:* ${format(totalmem())}
🔋 *𝗦𝘁𝗮𝘁𝘂𝘀 𝗦𝗶𝘀𝘁𝗲𝗺𝗮:* ${freeMemPerc}% Livre

🕸️ _Sistemas operando em perfeita escuridão._
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`.trim()

    await conn.sendMessage(m.chat, { 
        text: info,
        contextInfo: {
            externalAdReply: {
                title: '☾ 𝖦𝗈́𝗍𝗂𝖼𝖺 𝖡𝗈𝗍 𝖯𝗂𝗇𝗀 𝖲𝗒𝗌𝗍𝖾𝗆 ☽',
                body: 'Status em tempo real',
                thumbnailUrl: 'https://files.catbox.moe/yyk5xo.jpg', // Mesma imagem do seu menu
                sourceUrl: 'https://files.catbox.moe/yyk5xo.jpg',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = /^(ping|p)$/i

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}