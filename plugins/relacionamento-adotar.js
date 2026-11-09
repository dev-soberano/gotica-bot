/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !adotar
 */

import {
    cleanJid,
    getAlvo,
    lerFamilia,
    salvarFamilia,
    enviarComMencoes,
    esperarResposta
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ Só funciona em grupos.')

    try {
        const pai = cleanJid(m.sender)
        const filho = getAlvo(m)

        if (!filho) return m.reply('❌ Marque ou responda quem você quer adotar.')
        if (cleanJid(pai) === cleanJid(filho)) return m.reply('🤡 Você não pode ser seu próprio pai!')

        const db = lerFamilia()
        if (!db[m.chat]) db[m.chat] = {}
        if (!db[m.chat][pai]) db[m.chat][pai] = { esposas: [], filhos: [], irmaos: [] }
        if (!db[m.chat][filho]) db[m.chat][filho] = { esposas: [], filhos: [], irmaos: [] }

        if ((db[m.chat][pai].filhos || []).some((f) => cleanJid(f) === filho)) {
            return m.reply('⚠️ Esse membro já é seu filho(a)!')
        }

        const msgPedido = `🍼 *PEDIDO DE ADOÇÃO* 🍼\n\n@${filho.split('@')[0]}, você aceita ser filho(a) de @${pai.split('@')[0]}?\n\nResponda com *sim* ou *não* em 60 segundos.`

        await enviarComMencoes(conn, m, msgPedido, [filho, pai])

        const resposta = await esperarResposta(conn, m.chat, filho)

        if (resposta === 'sim') {
            // relê o banco depois da espera para não sobrescrever mudanças feitas nesse meio tempo
            const dbAtual = lerFamilia()
            if (!dbAtual[m.chat]) dbAtual[m.chat] = {}
            if (!dbAtual[m.chat][pai]) dbAtual[m.chat][pai] = { esposas: [], filhos: [], irmaos: [] }
            if (!dbAtual[m.chat][filho]) dbAtual[m.chat][filho] = { esposas: [], filhos: [], irmaos: [] }

            if (!dbAtual[m.chat][pai].filhos.includes(filho)) dbAtual[m.chat][pai].filhos.push(filho)
            dbAtual[m.chat][filho].pai = pai
            salvarFamilia(dbAtual)

            await enviarComMencoes(
                conn, m,
                `🍼🎉 *FAMÍLIA CRESCEU!* \n\n@${pai.split('@')[0]} adotou @${filho.split('@')[0]} como seu novo herdeiro(a)!`,
                [pai, filho]
            )
        } else {
            await m.reply('💔 O pedido de adoção foi recusado ou ignorado.')
        }
    } catch (error) {
        console.error('[ADOTAR]', error)
        return m.reply('❌ Erro ao processar a adoção.')
    }
}

handler.help = ['adotar @pessoa']
handler.tags = ['relacionamento']
handler.command = ['adotar', 'filho', 'filha']
handler.group = true

export default handler
