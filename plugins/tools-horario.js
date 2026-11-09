/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import moment from 'moment-timezone';

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

const handler = async (m, { conn, usedPrefix, command }) => {
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 30 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para consultar o horário novamente.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    const format = 'DD/MM HH:mm';
    const fechabra = moment().tz('America/Sao_Paulo').format(format);
    const fechaper = moment().tz('America/Lima').format(format);
    const fechamex = moment().tz('America/Mexico_City').format(format);
    const fechaarg = moment().tz('America/Argentina/Buenos_Aires').format(format);
    const fechacol = moment().tz('America/Bogota').format(format);
    const fechachile = moment().tz('America/Santiago').format(format);
    const fechapt = moment().tz('Europe/Lisbon').format(format);
    const fechanew = moment().tz('America/New_York').format(format);
    const fechaasi = moment().tz('Asia/Tokyo').format(format);
    
    let info = `「 🕒 FUSO HORÁRIO MUNDIAL 」

⏱️ *Brasil* : ${fechabra} 🇧🇷
⏱️ *Portugal* : ${fechapt} 🇵🇹
⏱️ *Argentina* : ${fechaarg} 🇦🇷
⏱️ *Chile* : ${fechachile} 🇨🇱
⏱️ *Colômbia* : ${fechacol} 🇨🇴
⏱️ *Peru* : ${fechaper} 🇵🇪
⏱️ *México* : ${fechamex} 🇲🇽
⏱️ *Nova York* : ${fechanew} 🇺🇸
⏱️ *Tóquio* : ${fechaasi} 🇯🇵

*🌍 Horário do Servidor:*
[ ${Intl.DateTimeFormat().resolvedOptions().timeZone} ]
${moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('DD/MM/YYYY HH:mm:ss')}

> *Gerado por:* Gotica Bot`.trim()

    await conn.sendMessage(m.chat, { text: info }, { quoted: m });
};

handler.help = ['horario'];
handler.tags = ['tools'];
handler.command = ['horario', 'hora', 'fuso'];
handler.register = false; // SEM TRAVA

export default handler;