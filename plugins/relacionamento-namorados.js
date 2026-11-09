/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !namorados
 */

import {
    cleanJid,
    lerRelacionamentos,
    enviarComMencoes
} from '../lib/relacionamentos.js'

let handler = async (m, { conn }) => {
    if (!m.chat.endsWith('@g.us')) return m.reply('❌ Só em grupos.')

    try {
        const relacionamentos = lerRelacionamentos()
        const doGrupo = relacionamentos[m.chat] || {}

        const mentions = []
        const jaListados = new Set()
        let resposta = '❤️ *CASAIS DO GRUPO* ❤️\n\n'
        let contador = 0

        for (const usuarioJid in doGrupo) {
            const usuario = cleanJid(usuarioJid)
            if (jaListados.has(usuario)) continue

            const info = doGrupo[usuarioJid]
            if (!info?.parceiro) continue

            const parceiro = cleanJid(info.parceiro)

            jaListados.add(usuario)
            jaListados.add(parceiro)

            mentions.push(usuario, parceiro)
            contador++

            const emoji = info.status === 'namorando' ? '💘' : '💍'
            const statusText = String(info.status || 'casado').toUpperCase()

            resposta += `${contador}. ${emoji} *${statusText}:*\n@${usuario.split('@')[0]} ❤️ @${parceiro.split('@')[0]}\n\n`
        }

        if (contador === 0) {
            return m.reply('💔 Ninguém está em um relacionamento neste grupo.')
        }

        resposta += 'Felicidades aos pombinhos! ✨💅'

        await enviarComMencoes(conn, m, resposta, mentions)
    } catch (error) {
        console.error('[NAMORADOS]', error)
        return m.reply('❌ Erro ao buscar a lista de casais.')
    }
}

handler.help = ['namorados']
handler.tags = ['relacionamento']
handler.command = ['namorados', 'casados', 'casais']
handler.group = true

export default handler
