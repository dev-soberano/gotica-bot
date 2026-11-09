/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !casar
 *
 * O Soberano (dono do bot) casa sem precisar de consentimento, igual ao
 * sistema original. Para membros comuns, o alvo responde "sim" ou "não".
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

let handler = async (m, { conn, isSoberano }) => {
    if (!m.isGroup) return m.reply('✨ ❌ Este comando só funciona em grupos.')

    try {
        const remetente = cleanJid(m.sender)
        const pretendente = getAlvo(m)

        if (!pretendente) return m.reply('❌ Você precisa marcar (@) ou responder alguém!')
        if (cleanJid(remetente) === cleanJid(pretendente)) {
            return m.reply('🤡 Casar com você mesmo? Nem a Gótica aceita isso.')
        }

        const remetenteStatus = getRelacionamentoStatus(m.chat, remetente)
        const pretendenteStatus = getRelacionamentoStatus(m.chat, pretendente)

        if (remetenteStatus?.status === 'casado') {
            return m.reply('⚠️ Você já é casado(a)! Quer ser preso por bigamia? 👮')
        }
        if (pretendenteStatus?.status === 'casado') {
            return m.reply('⚠️ Essa pessoa já subiu ao altar com outro(a).')
        }
        if (remetenteStatus) return m.reply('💅 Você já está namorando. Termine primeiro se quiser casar!')
        if (pretendenteStatus) return m.reply('💅 Essa pessoa já está namorando alguém.')

        // --- LÓGICA ESPECIAL PARA O SOBERANO ---
        if (isSoberano) {
            const db = lerRelacionamentos()
            if (!db[m.chat]) db[m.chat] = {}

            db[m.chat][remetente] = { parceiro: pretendente, status: 'casado' }
            db[m.chat][pretendente] = { parceiro: remetente, status: 'casado' }
            salvarRelacionamentos(db)

            const msgSoberano = `👰‍♀️🤵‍♂️ *CASAMENTO FORÇADO PELO SOBERANO!* \n\n` +
                `@${remetente.split('@')[0]} escolheu @${pretendente.split('@')[0]} para ser sua companhia eterna.\n\n` +
                `Como @${remetente.split('@')[0]} é o *Soberano Mestre Supremo*, @${pretendente.split('@')[0]} não pode dizer não! 😈\n\n` +
                `Estão oficialmente casados sob o domínio da Gótica! ✨🥂`

            return enviarComMencoes(conn, m, msgSoberano, [remetente, pretendente])
        }

        // --- LÓGICA NORMAL PARA MEMBROS COMUNS ---
        const pedidoText = `🥂 *PEDIDO DE CASAMENTO* 🥂\n\n@${pretendente.split('@')[0]}, você aceita se casar com @${remetente.split('@')[0]}?\n\n💍 *Custo do Cartório:* R$ 500,00\n\nResponda com *sim* ou *não* em 60 segundos.`

        await enviarComMencoes(conn, m, pedidoText, [pretendente, remetente])

        const resposta = await esperarResposta(conn, m.chat, pretendente)

        if (resposta === 'sim') {
            const db = lerRelacionamentos()
            if (!db[m.chat]) db[m.chat] = {}

            db[m.chat][remetente] = { parceiro: pretendente, status: 'casado' }
            db[m.chat][pretendente] = { parceiro: remetente, status: 'casado' }
            salvarRelacionamentos(db)

            const msgFinal = `👰‍♀️🤵‍♂️ *RECÉM-CASADOS!* \n\nNuma cerimônia gótica e luxuosa, @${remetente.split('@')[0]} e @${pretendente.split('@')[0]} juraram amor eterno!\n\n💸 A taxa de R$ 500,00 foi debitada. Felicidades! ✨🥂`
            await enviarComMencoes(conn, m, msgFinal, [remetente, pretendente])
        } else if (resposta === 'não') {
            await enviarComMencoes(
                conn, m,
                `💔 *REJEITADO!* @${pretendente.split('@')[0]} deixou @${remetente.split('@')[0]} no altar. Que mico!`,
                [pretendente, remetente]
            )
        } else {
            await m.reply('⌛ O padre cansou de esperar. Pedido cancelado por vácuo.')
        }
    } catch (error) {
        console.error('[CASAR]', error)
        return m.reply('❌ Erro ao organizar o casamento.')
    }
}

handler.help = ['casar @pessoa']
handler.tags = ['relacionamento']
handler.command = ['casar', 'casamento']
handler.group = true

export default handler
