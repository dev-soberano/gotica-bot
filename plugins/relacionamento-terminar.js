/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !terminar
 */

import {
    cleanJid,
    mesmaPessoa,
    lerRelacionamentos,
    salvarRelacionamentos,
    enviarComMencoes
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.isGroup) return

    try {
        const db = lerRelacionamentos()
        const grupo = db[m.chat] || {}

        const chaveMeu = Object.keys(grupo).find((k) => mesmaPessoa(k, m.sender))

        if (!chaveMeu) {
            return m.reply('🤨 Você está solteiro(a). Não dá para terminar o que não existe, pare de passar vergonha! 🤡')
        }

        const meuId = cleanJid(chaveMeu)
        const relacionamento = grupo[chaveMeu]
        const parceiroId = cleanJid(relacionamento.parceiro || '')
        const statusAtual = relacionamento.status // 'namorando' ou 'casado'

        if (!parceiroId) {
            delete grupo[chaveMeu]
            salvarRelacionamentos(db)
            return m.reply('🤨 Seu registro estava incompleto e foi limpo. Agora você está solteiro(a)!')
        }

        const chaveParceiro = Object.keys(grupo).find((k) => mesmaPessoa(k, parceiroId))

        delete grupo[chaveMeu]
        if (chaveParceiro) delete grupo[chaveParceiro]

        salvarRelacionamentos(db)
        await m.react('💔').catch(() => {})

        let titulo, fraseFinal
        if (statusAtual === 'casado') {
            titulo = '⚖️ *DIVÓRCIO JUDICIAL PAPAL* ⚖️'
            fraseFinal = 'O papel do divórcio foi assinado. Quem fica com a casa e o bot? 🏚️💅'
        } else {
            titulo = '💔 *ACABOU O AMOR!*'
            fraseFinal = 'Voltou para a pista! Desejo sorte para quem aguentar vocês agora! ✨'
        }

        const msg = `${titulo}\n\n@${meuId.split('@')[0]} colocou um fim no ${statusAtual} com @${parceiroId.split('@')[0]}.\n\n_${fraseFinal}_`

        await enviarComMencoes(conn, m, msg, [meuId, parceiroId])
    } catch (error) {
        console.error('[TERMINAR]', error)
        return m.reply('❌ Erro ao encerrar o relacionamento.')
    }
}

handler.help = ['terminar']
handler.tags = ['relacionamento']
handler.command = ['terminar', 'separar', 'divorciar', 'divorcio']
handler.group = true

export default handler
