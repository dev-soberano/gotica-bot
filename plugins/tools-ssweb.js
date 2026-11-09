/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 20 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) return
        cooldowns[m.sender] = Date.now()
    }

    if (!args[0]) return m.reply(`*📸 Por favor, insira o link da página que deseja capturar.*\n\n*Exemplo:* ${usedPrefix + command} https://github.com/leandromemes`)
    
    // Validação básica de URL
    let url = args[0].startsWith('http') ? args[0] : 'https://' + args[0]

    await m.react('🔍')
    m.reply('*⏳ Capturando imagem da página... Aguarde.*')

    try {
        let ss = await (await fetch(`https://image.thum.io/get/fullpage/${url}`)).buffer()
        
        await conn.sendFile(m.chat, ss, 'screenshot.png', `*✅ SCREENSHOT GERADA COM SUCESSO*\n🌐 *Site:* ${url}`, m)
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('*❌ Ocorreu um erro ao capturar a página. Verifique o link e tente novamente.*')
    }
}

handler.help = ['ssweb <link>', 'ss']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss', 'print']
handler.register = false // SEM TRAVA

export default handler