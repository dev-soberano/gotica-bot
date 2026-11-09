/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !familia
 */

import {
    cleanJid,
    lerFamilia,
    lerRelacionamentos,
    enviarComMencoes
} from '../lib/relacionamentos.js'

let handler = async (m, { conn, isSoberano }) => {
    try {
        const user = cleanJid(m.sender)

        const dbFamilia = lerFamilia()
        const dbRelacionamentos = lerRelacionamentos()

        const familiaData = dbFamilia[m.chat]?.[user] || {}
        const relacaoData = dbRelacionamentos[m.chat]?.[user] || {}

        if (!familiaData.pai && !familiaData.filhos?.length && !familiaData.irmaos?.length && !relacaoData.parceiro) {
            return m.reply('🥀 Você ainda não tem família registrada aqui.')
        }

        let msg = isSoberano
            ? `👑 *FAMÍLIA DO SOBERANO* 👑\n\n`
            : `🦇 *MINHA FAMÍLIA GÓTICA* 🦇\n\n`

        const mentions = []

        // 1. ESPOSA / MARIDO / NAMORADA(O)
        if (relacaoData.parceiro) {
            const termo = relacaoData.status === 'casado' ? 'Esposa(o)' : 'Namorada(o)'
            msg += `💍 *${termo}:* @${relacaoData.parceiro.split('@')[0]}\n`
            mentions.push(relacaoData.parceiro)
        }

        // 2. PAI / MÃE
        if (familiaData.pai) {
            msg += `👨‍👦 *Pai/Mãe:* @${familiaData.pai.split('@')[0]}\n`
            mentions.push(familiaData.pai)
        }

        // 3. FILHOS
        if (familiaData.filhos?.length > 0) {
            msg += `🍼 *Filhos:* \n` + familiaData.filhos.map((f) => {
                mentions.push(f)
                return ` └ @${f.split('@')[0]}`
            }).join('\n') + '\n'
        }

        // 4. IRMÃOS
        if (familiaData.irmaos?.length > 0) {
            msg += `👥 *Irmãos:* \n` + familiaData.irmaos.map((i) => {
                mentions.push(i)
                return ` └ @${i.split('@')[0]}`
            }).join('\n') + '\n'
        }

        msg += `\n_A família é a nossa base!_ 🦇`

        await enviarComMencoes(conn, m, msg, mentions)
    } catch (error) {
        console.error('[FAMILIA]', error)
        return m.reply('❌ Erro ao montar sua árvore genealógica.')
    }
}

handler.help = ['familia']
handler.tags = ['relacionamento']
handler.command = ['familia', 'arvore', 'parentes']
handler.group = true

export default handler
