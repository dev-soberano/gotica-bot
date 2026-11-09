/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // LISTA DE GRUPOS VIP (Mural)
    const gruposVip = [
        { nome: '🌀 COMPLEXO 🌀', id: '120363407678212501@g.us' }
    ]

    // Tutorial quando enviar o comando vazio
    let [target, ...msg] = text.split(' ')
    
    if (!target || msg.length === 0) {
        let helpText = `*Opa!* ✋\n\n`
        helpText += `Use o formato:\n*${usedPrefix + command} numero mensagem*\n\n`
        helpText += `*Exemplo:*\n*${usedPrefix + command} 551199999999 Olá sou seu fã...*\n\n`
        helpText += `⚠️ *AVISO:* Este comando é exclusivo para grupos *VIP*. Sua mensagem será postada anonimamente no mural dos seguintes grupos:\n\n`
        
        gruposVip.forEach((gp, i) => {
            helpText += `${i + 1}. ${gp.nome}\n`
        })
        
        return m.reply(helpText)
    }

    if (m.isGroup) return m.reply('*Shhh!* 🤫 Me mande a confissão no meu *PRIVADO* para ser anônimo.')

    // Processamento da Confissão
    let jid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    let mensagemReal = msg.join(' ')

    try {
        await m.react('💋')
        
        let teks = `💋 *MURAL DE CONFISSÕES* 💋\n\n`
        teks += `*Para:* @${jid.split('@')[0]}\n\n`
        teks += `*Confissão:* “ ${mensagemReal} ”\n\n`
        teks += `________________________\n`
        teks += `*Mande a sua no meu PV usando:*\n\n`
        teks += `*»* \`${usedPrefix + command}\`\n\n`
        teks += `*Ass:* Anônimo 👤`

        for (let gp of gruposVip) {
            await conn.sendMessage(gp.id, {
                text: teks,
                mentions: [jid],
                contextInfo: {
                    externalAdReply: {
                        title: `${gp.nome} - MURAL OFICIAL`,
                        body: 'Uma nova confissão anônima chegou!',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyz1dMPkZuNleUyfXPMsltHwKKdVddTf4-A&usqp=CAU',
                        sourceUrl: 'https://chat.whatsapp.com/HhIATn48XsuAbduwn8sowT',
                    }
                }
            }, { quoted: null })
        }

        return m.reply(`✅ *POSTADO COM SUCESSO!*\n\nSua confissão foi enviada para o mural do grupo VIP.`)

    } catch (e) {
        m.reply(`❌ *Erro:* Verifique se o número está correto.`)
    }
}

handler.help = ['confessar']
handler.tags = ['fun']
handler.command = ['confessar', 'anonimo', 'mural']
handler.register = false 

// Cooldown de 10 minutos
handler.cooldown = 10 

export default handler