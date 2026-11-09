/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot - DOXEAR SYSTEM (FUN)
 */

import { performance } from 'perf_hooks'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    // Identifica o alvo marcado ou respondido de forma nativa
    let who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : text 
                ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                : null

    if (!who || who === '@s.whatsapp.net') {
        return conn.reply(m.chat, `⚠️ Por favor, marque alguém ou responda a uma mensagem para puxar a capivara/doxxear.`, m)
    }

    let userName = 'Desconhecido'
    try {
        userName = await conn.getName(who)
    } catch {
        userName = `@${who.split('@')[0]}`
    }

    const getRandomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    const getRandomMAC = () => 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)])
    const getRandomPort = () => Math.floor(Math.random() * 65535)
    
    const brands = ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max', 'Xiaomi 13 Pro', 'Google Pixel 8', 'Huawei P60 Pro', 'Motorola Edge 40']
    const os = ['Android 14', 'iOS 17.2', 'Windows 11 Mobile', 'HarmonyOS 4.0']
    const nets = ['Claro', 'VIVO', 'TIM', 'Oi Fibra', 'Starlink Enterprise', 'Brisanet']

    let steps = [
        `🔄 *Conectando ao servidor de satélite...*`,
        `🔓 *Bypassando firewall do dispositivo...* [Sucesso]`,
        `💉 *Injetando payload SQL em ${userName}...*`,
        `📂 *Decodificando arquivos locais (WhatsApp.db)...*`,
        `☁️ *Extraindo fotos da galeria privada...*`,
        `📍 *Triangulando localização GPS precisa...*`
    ]

    const { key } = await conn.sendMessage(m.chat, { text: `💻 *INICIANDO PROTOCOLO DE DOXXEO v9.2*...` }, { quoted: m })

    for (let step of steps) {
        await delay(800)
        await conn.sendMessage(m.chat, { text: step, edit: key })
    }

    let doxeo = `☠️ *RELATÓRIO DE ACESSO FINALIZADO* ☠️

👤 *Vítima:* ${userName}
🆔 *ID:* @${who.split('@')[0]}
📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}
⏰ *Hora:* ${new Date().toLocaleTimeString('pt-BR')}

📡 *DADOS DE REDE:*
*IPv4 PÚBLICO:* ${getRandomIP()}
*IPv4 PRIVADO:* 192.168.1.${Math.floor(Math.random() * 100)}
*MAC ADDRESS:* ${getRandomMAC()}
*PROVEDOR (ISP):* ${pickRandom(nets)}
*LATÊNCIA:* ${Math.floor(Math.random() * 100)}ms
*DNS PRIMÁRIO:* 8.8.8.8 (Google)
*PORTAS ABERTAS:* ${getRandomPort()}, 80, 443, 8080

📱 *DISPOSITIVO:*
*MODELO:* ${pickRandom(brands)}
*SISTEMA OS:* ${pickRandom(os)}
*BATERIA:* ${Math.floor(Math.random() * 100)}% 🔋
*TEMPO DE ATIVIDADE:* ${Math.floor(Math.random() * 400)} horas
*GPU:* Adreno ${Math.floor(Math.random() * 100) + 600} / Apple GPU

📍 *LOCALIZAÇÃO ESTIMADA:*
*LATITUDE:* -${Math.random().toFixed(6)}
*LONGITUDE:* -${Math.random().toFixed(6)}
*ZONA:* ${pickRandom(['Porão da casa', 'Casa da avó', 'Lan house', 'Escola pública', 'No banheiro', 'Atrás da moita'])}

📂 *ARQUIVOS ENCONTRADOS:*
*FOTOS:* ${Math.floor(Math.random() * 5000)}
*CHATS:* ${Math.floor(Math.random() * 300)}
*PESQUISAS DO GOOGLE:* "Como ficar bonito", "Hack para Free Fire", "Porno de anões", "Como conseguir robux grátis"

⚠️ _O dispositivo foi infectado com sucesso. Recomenda-se formatar._`

    await conn.sendMessage(m.chat, { text: doxeo, edit: key, mentions: [who] })
}

handler.help = ['doxear']
handler.tags = ['fun']
handler.command = ['doxear', 'doxxeo', 'doxeo', 'doxxear']
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))