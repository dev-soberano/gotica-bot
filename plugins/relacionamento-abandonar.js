/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !abandonar
 */

import {
    cleanJid,
    getAlvo,
    lerFamilia,
    salvarFamilia,
    enviarComMencoes
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ Só funciona em grupos.')

    try {
        const pai = cleanJid(m.sender)
        const filho = getAlvo(m)

        if (!filho) return m.reply('⚠️ Marque ou responda quem você deseja abandonar.')

        const db = lerFamilia()

        if (!db[m.chat] || !db[m.chat][pai]) {
            return m.reply('🤡 Você não tem nenhum registro de família neste grupo.')
        }

        const listaFilhos = db[m.chat][pai].filhos || []
        const index = listaFilhos.findIndex((f) => cleanJid(f) === cleanJid(filho))

        if (index === -1) {
            return m.reply('⚠️ Essa pessoa não consta como seu filho(a) no meu registro deste grupo!')
        }

        db[m.chat][pai].filhos.splice(index, 1)

        const filhoDados = db[m.chat][filho]
        if (filhoDados) {
            if (filhoDados.pai && cleanJid(filhoDados.pai) === cleanJid(pai)) delete filhoDados.pai
            if (filhoDados.mae && cleanJid(filhoDados.mae) === cleanJid(pai)) delete filhoDados.mae
        }

        salvarFamilia(db)
        await m.react('🚬').catch(() => {})

        const texto = `⚖️ *ABANDONO DE INCAPAZ*\n\n@${pai.split('@')[0]} disse que ia ali na esquina comprar um maço de cigarro e nunca mais voltou. \n\n@${filho.split('@')[0]} foi deixado para trás e não faz mais parte da família! 🚬🏃‍♂️💨`

        await enviarComMencoes(conn, m, texto, [pai, filho])
    } catch (error) {
        console.error('[ABANDONAR]', error)
        return m.reply('❌ Erro ao processar o abandono.')
    }
}

handler.help = ['abandonar @filho']
handler.tags = ['relacionamento']
handler.command = ['abandonar', 'deserdar']
handler.group = true

export default handler
