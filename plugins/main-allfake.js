/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
const { proto } = pkg

var handler = m => m

handler.all = async function (m) {

    global.getBuffer = async function getBuffer(url, options) {
        try {
            options ? options : {}
            var res = await axios({
                method: "get",
                url,
                headers: {
                    'DNT': 1,
                    'User-Agent': 'GoogleBot',
                    'Upgrade-Insecure-Request': 1
                },
                ...options,
                responseType: 'arraybuffer'
            })
            return res.data
        } catch (e) {
            console.log(`Erro : ${e}`)
        }
    }

    // Novas imagens enviadas
    const iconUrls = [
        "https://files.catbox.moe/th9d3p.jpeg",
        "https://files.catbox.moe/ob7j4s.jpeg",
        "https://files.catbox.moe/agyn6l.jpeg",
        "https://files.catbox.moe/yaluy5.jpeg",
        "https://files.catbox.moe/xuovgx.jpeg",
        "https://files.catbox.moe/qds458.jpeg",
        "https://files.catbox.moe/qsku4l.jpeg",
        "https://files.catbox.moe/malpts.jpeg"
    ]

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    const iconUrl = pickRandom(iconUrls)
    global.icono = await getBuffer(iconUrl)

    // Contato fake com seu novo número
    global.fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Soberano" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=556391330669:556391330669\nitem1.X-ABLabel:Celular\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    // Dados do Canal e Criador atualizados
    global.creador = 'https://wa.me/556391330669'
    global.asistencia = 'https://wa.me/556391330669'
    global.canal = 'https://whatsapp.com/channel/0029Vb7PsjVA89Md7LCwWN1u'
    global.namechannel = '⏤͟͞ू⃪፝͜⁞⟡『 𝐆͢𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭: 𝐃𝐞𝐯 𝐋𝐞𝐚𝐧𝐝𝐫𝐨 』࿐⟡'
    
    // Configurações de data/hora em PT-BR
    global.d = new Date(new Date + 3600000)
    global.locale = 'pt-br'
    global.fecha = d.toLocaleDateString('pt-br', {day: 'numeric', month: 'numeric', year: 'numeric'})
    global.tiempo = d.toLocaleString('pt-br', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

    // Saudação automática
    var ase = new Date(); var hour = ase.getHours();
    switch(hour){
        case 0: case 1: case 2: hour = 'Boa Noite 🌃'; break;
        case 3: case 4: case 5: case 6: case 7: case 8: case 9: hour = 'Bom Dia 🌄'; break;
        case 10: case 11: case 12: case 13: hour = 'Bom Dia 🌤'; break;
        case 14: case 15: case 16: case 17: case 18: hour = 'Boa Tarde 🌆'; break;
        default: hour = 'Boa Noite 🌃'
    }
    global.saludo = hour

    // Selo de Canal Oficial (JID do Canal atualizado)
    global.rcanal = {
        contextInfo: {
            mentionedJid: [], 
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363405588045392@newsletter',
                newsletterName: '𝐆𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥',
                serverMessageId: -1
            },
            externalAdReply: {
                title: '𝐆𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭 𝐌𝐃',
                body: '𝐃𝐞𝐯 𝐋𝐞𝐚𝐧𝐝𝐫𝐨',
                thumbnail: icono,
                sourceUrl: canal,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }
}

export default handler