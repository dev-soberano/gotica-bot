/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 5 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) return
        cooldowns[m.sender] = Date.now()
    }

    if (!args.length) return m.reply(`*🗣️ Por favor, escreva o texto que deseja que eu repita.* \n\n*Exemplo:* ${usedPrefix + command} Olá Mundo`);
    
    let message = args.join(' ');

    // Caractere invisível para evitar que o bot ignore mensagens idênticas
    let invisibleChar = '\u200B';
    let finalMessage = invisibleChar + message;

    // Detecta marcações no texto (ex: @556391330669)
    let mentions = [...message.matchAll(/@(\d+)/g)].map(v => v[1] + '@s.whatsapp.net');

    if (mentions.length) {
        await conn.sendMessage(m.chat, { text: finalMessage, mentions }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, { text: finalMessage }, { quoted: m });
    }
};

handler.help = ['say <texto>']
handler.tags = ['tools']
handler.command = ['say', 'falar', 'repetir']
handler.group = true
handler.register = false // SEM TRAVA

export default handler