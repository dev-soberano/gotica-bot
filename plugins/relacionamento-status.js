/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !status
 */

import {
    cleanJid,
    getRelacionamentoStatus,
    enviarComMencoes
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('✨ ❌ Este comando só funciona em grupos.')

    try {
        const user = cleanJid(m.sender)
        const status = getRelacionamentoStatus(m.chat, user)

        let mensagem
        const mentions = [user]

        if (!status || !status.parceiro) {
            mensagem = `
🖤 *INVENTÁRIO AMOROSO* 🖤
------------------------------------------
👤 *Usuário:* @${user.split('@')[0]}
💍 *Status:* \`SOLTEIRO(A)\`
📉 *Situação:* Disponível na pista!

_Dica: Use !namorar @pessoa para sair da seca._
------------------------------------------`.trim()

            await m.react('🔍').catch(() => {})
        } else {
            const tipo = status.status
            let parceiroJid = cleanJid(status.parceiro)

            // Reconstrói o JID do parceiro para garantir o nome azul
            if (!parceiroJid.includes('@')) {
                parceiroJid = parceiroJid.length > 15
                    ? `${parceiroJid}@lid`
                    : `${parceiroJid}@s.whatsapp.net`
            }

            mentions.push(parceiroJid)

            const emojiRel = tipo === 'namorando' ? '💘' : '💍'
            const comandoFim = tipo === 'namorando' ? '!terminar' : '!divorciar'

            mensagem = `
${emojiRel} *CERTIDÃO DE RELACIONAMENTO* ${emojiRel}
------------------------------------------
👤 *Titular:* @${user.split('@')[0]}
❤️ *Compromissado(a) com:* @${parceiroJid.split('@')[0]}
📜 *Tipo:* \`${String(tipo).toUpperCase()}\`

✨ _Que a Gótica Bot abençoe essa união!_
------------------------------------------
💡 _Para encerrar, use ${comandoFim}_`.trim()

            await m.react(tipo === 'namorando' ? '❤️' : '🥂').catch(() => {})
        }

        await enviarComMencoes(conn, m, mensagem, mentions)
    } catch (error) {
        console.error('[STATUS]', error)
        return m.reply('❌ Ocorreu um erro ao verificar seu histórico amoroso.')
    }
}

handler.help = ['status']
handler.tags = ['relacionamento']
handler.command = ['status', 'verstatus', 'relacionamento', 'meuamor']
handler.group = true

export default handler
