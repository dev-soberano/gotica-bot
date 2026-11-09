/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 60 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para rastrear outro IP.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (!text) return m.reply(`*🌐 Por favor, insira um endereço de IP!*\n\n*Exemplo:* ${usedPrefix + command} 8.8.8.8`)

    await m.react('🔍')
    m.reply('*🍭 Buscando informações, aguarde um momento...*')

    try {
        const res = await axios.get(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
        const data = res.data

        if (data.status !== "success") {
            throw new Error(data.message || "IP não encontrado")
        }

        let ipsearch = `
☁️ *I N F O R M A Ç Ã O - I P* ☁️

*📍 IP:* ${data.query}
*🌎 País:* ${data.country} (${data.countryCode})
*🏙️ Estado:* ${data.regionName}
*🌆 Cidade:* ${data.city}
*📮 CEP:* ${data.zip || 'N/A'}
*⏰ Fuso Horário:* ${data.timezone}
*📡 ISP:* ${data.isp}
*🏢 Org:* ${data.org}
*🔗 AS:* ${data.as}
*📱 Mobile:* ${data.mobile ? "Sim" : "Não"}
*🖥️ Hospedagem:* ${data.hosting ? "Sim" : "Não"}

> *Rastreado por:* Gotica Bot`.trim()

        await conn.reply(m.chat, ipsearch, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        return m.reply(`*❌ ERRO:* Não foi possível encontrar informações para este IP.\n*Detalhe:* ${e.message}`)
    }
}

handler.help = ['ip <endereço ip>']
handler.tags = ['tools']
handler.command = ['ip', 'rastrearip']
handler.register = false // SEM TRAVA DE REGISTRO

export default handler