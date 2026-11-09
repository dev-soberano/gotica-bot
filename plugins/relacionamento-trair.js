/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !trair
 */

import {
    cleanJid,
    getAlvo,
    enviarComMencoes
} from '../lib/relacionamentos.js'

const MENSAGENS = [
    '💔 @{remetente} não aguentou a tentação e traiu @{traido}! O grupo parou para ver esse barraco.',
    '🐍 @{remetente} foi flagrado(a) pulando a cerca! @{traido}, sinto cheiro de chifre no ar...',
    '🎭 @{remetente} entregou uma atuação digna de Oscar, mas @{traido} descobriu a traição!',
    '📉 @{remetente} traiu @{traido}. O mercado de chifres está em alta hoje!',
    '👀 @{remetente} achou que ninguém ia ver, mas a Gótica Bot viu tudo! Forças, @{traido}.'
]

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('✨ ❌ Este comando só funciona em grupos.')

    try {
        const remetente = cleanJid(m.sender)
        const traido = getAlvo(m)

        if (!traido) return m.reply('❌ Marque o chifrudo(a) ou responda a mensagem dele(a)!')
        if (cleanJid(traido) === cleanJid(remetente)) {
            return m.reply('🚨 Auto-traição? Isso se chama crise de identidade, procure um psicólogo. 💅')
        }

        await m.react('🐍').catch(() => {})

        const caraDePau = Math.floor(Math.random() * 101)
        const blocos = Math.floor(caraDePau / 10)
        const barra = '🔥'.repeat(blocos) + '░'.repeat(10 - blocos)

        const template = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)]

        const mensagemFinal = `
🚨 *ALERTA DE TALARICAGEM* 🚨
------------------------------------------
${template.replace('{remetente}', remetente.split('@')[0]).replace('{traido}', traido.split('@')[0])}

🎭 *Nível de Cara de Pau:* ${caraDePau}%
[${barra}]

⚖️ *VEREDITO:* _${caraDePau > 70 ? 'Pura maldade no coração.' : 'Foi um deslize... ou não.'}_
------------------------------------------
_Obs: A fofoca foi espalhada com sucesso!_
`.trim()

        await enviarComMencoes(conn, m, mensagemFinal, [remetente, traido])
    } catch (error) {
        console.error('[TRAIR]', error)
        return m.reply('❌ Erro ao processar a traição.')
    }
}

handler.help = ['trair @pessoa']
handler.tags = ['relacionamento']
handler.command = ['trair', 'traicao', 'chifre']
handler.group = true

export default handler
