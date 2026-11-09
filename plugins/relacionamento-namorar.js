/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !namorar
 */

import {
    cleanJid,
    getAlvo,
    getRelacionamentoStatus,
    lerRelacionamentos,
    salvarRelacionamentos,
    enviarComMencoes,
    esperarResposta
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('🙄 Quer namorar no privado? Vá para um grupo!')

    try {
        const remetente = cleanJid(m.sender)
        const pretendente = getAlvo(m)

        if (!pretendente) return m.reply('⚠️ Marque (@) ou responda alguém!')

        if (cleanJid(remetente) === cleanJid(pretendente)) {
            return m.reply('🤡 Querendo namorar consigo mesmo?')
        }

        if (getRelacionamentoStatus(m.chat, remetente) || getRelacionamentoStatus(m.chat, pretendente)) {
            return m.reply('💅 Alguém aqui já está ocupado!')
        }

        await m.react('💘').catch(() => {})

        const pedidoText = `💌 *PEDIDO DE NAMORO* 💌\n\n@${pretendente.split('@')[0]}, você foi pedido(a) em namoro por @${remetente.split('@')[0]}! 💍\n\nResponda com *sim* ou *não* em 60 segundos.`

        await enviarComMencoes(conn, m, pedidoText, [pretendente, remetente])

        const resposta = await esperarResposta(conn, m.chat, pretendente)

        if (resposta === 'sim') {
            const db = lerRelacionamentos()
            if (!db[m.chat]) db[m.chat] = {}

            db[m.chat][remetente] = { parceiro: pretendente, status: 'namorando' }
            db[m.chat][pretendente] = { parceiro: remetente, status: 'namorando' }
            salvarRelacionamentos(db)

            await m.react('💏').catch(() => {})
            await enviarComMencoes(
                conn, m,
                `💑 *OFICIAL:* @${remetente.split('@')[0]} ❤️ @${pretendente.split('@')[0]} agora estão namorando! ✨💅`,
                [remetente, pretendente]
            )
        } else if (resposta === 'não') {
            await m.react('💔').catch(() => {})
            await enviarComMencoes(
                conn, m,
                `🤣 *RECUSADO!* @${remetente.split('@')[0]} foi rejeitado por @${pretendente.split('@')[0]}.`,
                [remetente, pretendente]
            )
        } else {
            await m.reply('⌛ Tempo esgotado!')
        }
    } catch (error) {
        console.error('[NAMORAR]', error)
        return m.reply('❌ Erro no processo.')
    }
}

handler.help = ['namorar @pessoa']
handler.tags = ['relacionamento']
handler.command = ['namorar', 'pedido']
handler.group = true

export default handler
