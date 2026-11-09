/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !pensao
 *
 * Usa a mesma economia do !pix (global.db.data.chats[chat].users[jid].coin),
 * então não cria um saldo paralelo nem interfere nos outros comandos.
 */

import {
    cleanJid,
    getAlvo,
    enviarComMencoes
} from '../lib/relacionamentos.js'

const formatarReal = (valor) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(valor)

let handler = async (m, { conn, args = [], usedPrefix = '!', command = 'pensao' }) => {
    const chat = global.db?.data?.chats?.[m.chat]

    if (!chat?.modoreal) {
        return m.reply('⚠️ O modo real não está ativado neste grupo.')
    }

    const destinatario = getAlvo(m)

    if (!destinatario) {
        return m.reply(`✨ ⚠️ Para pagar a pensão, responda a mensagem da pessoa com ${usedPrefix}${command} valor.`)
    }

    const valorFloat = parseFloat(String(args[0] || '').replace(',', '.'))
    const valor = Math.floor(valorFloat)

    if (isNaN(valor) || valor <= 0) {
        return m.reply('✨ ❌ Valor da pensão inválido. Digite um número inteiro.')
    }

    const pagador = cleanJid(m.sender)

    if (pagador === cleanJid(destinatario)) {
        return m.reply('✨ ❌ Você não pode pagar pensão para si mesmo. Onde já se viu? 🤡')
    }

    if (!chat.users) chat.users = {}
    if (!chat.users[pagador]) chat.users[pagador] = { coin: 0, bank: 0 }
    if (!chat.users[destinatario]) chat.users[destinatario] = { coin: 0, bank: 0 }

    if (chat.users[pagador].coin < valor) {
        return m.reply(`✨ ❌ Saldo insuficiente para a pensão! O oficial de justiça está chegando... Seu saldo: *${formatarReal(chat.users[pagador].coin)}*.`)
    }

    chat.users[pagador].coin -= valor
    chat.users[destinatario].coin += valor

    const pagadorNome = m.pushName || 'Alguém'

    const mensagem = `⚖️ *PENSÃO ALIMENTÍCIA* ⚖️
---------------------------------
💸 Valor pago: *${formatarReal(valor)}*
👤 Responsável: ${pagadorNome}
🍼 Beneficiário: @${destinatario.split('@')[0]}
---------------------------------
_Dever cumprido! Fuja da prisão hoje..._ 🦇`

    await enviarComMencoes(conn, m, mensagem, [destinatario])
}

handler.help = ['pensao valor']
handler.tags = ['relacionamento']
handler.command = ['pensao', 'alimentos', 'pensionista']
handler.group = true

export default handler
