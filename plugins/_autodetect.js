/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command, args, isAdmins, isOwner }) => {
    if (!isAdmins && !isOwner) {
        global.dfail('admin', m, conn)
        throw false
    }

    let chat = global.db.data.chats[m.chat]
    let isEnable = /true|enable|(on)|1/i.test(args[0])
    let isDisable = /false|disable|(off)|0/i.test(args[0])

    if (!args[0]) throw `*Soberano, use ${usedPrefix + command} on ou off*`

    if (isEnable) {
        if (chat.detect) {
            await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } })
            return m.reply(`*O sistema X9 já está ATIVADO, Não precisa repetir.* 🍷`)
        }
        chat.detect = true
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        m.reply(`*O X9 foi ATIVADO!* 🍷\n*Prepare-se, agora eu vou dedurar cada gracinha que fizerem aqui.*`)
    } else if (isDisable) {
        if (!chat.detect) {
            await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } })
            return m.reply(`*O X9 já está dormindo. Deixe-o em paz.* 🍷`)
        }
        chat.detect = false
        await conn.sendMessage(m.chat, { react: { text: "🛡️", key: m.key } })
        m.reply(`*O X9 foi DESATIVADO.* 🍷\n*Podem fazer bagunça, eu não vou mais contar nada.*`)
    }
}

handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.detect) return
    
    let usuario = `@${m.sender.split('@')[0]}`
    let text = ''
    let mentions = [m.sender]

    switch (m.messageStubType) {
        case 21: // Nome
            text = `📢 *X9 INFORMA: ALTERAÇÃO*\n\nO gênio do(a) ${usuario} resolveu mudar o nome do grupo para: *${m.messageStubParameters[0]}*. \n\n_Ficou uma porcaria, mas fazer o quê, né?_ 🍷`
            break
        case 22: // Foto
            text = `📢 *X9 INFORMA: ÍCONE*\n\n${usuario} mudou a foto do grupo. Espero que seja melhor que a anterior, porque o gosto aqui é duvidoso... 🖼️`
            break
        case 23: // Link revogado
            text = `📢 *X9 INFORMA: LINK*\n\n${usuario} resetou o link. Fugindo de alguém ou apenas querendo causar? O link antigo já era. 🚫`
            break
        case 24: // Descrição
            text = `📢 *X9 INFORMA: DESCRIÇÃO*\n\nA descrição do grupo foi alterada por ${usuario}. Ficou uma porcaria, mas fazer o quê, né? Quem quiser ver a mudança que vá nas informações do grupo. 🙄`
            break
        case 25: // Restrição de edição
            let edit = m.messageStubParameters[0] == 'on' ? 'Apenas Admins (Ditadura)' : 'Todos (Bagunça)'
            text = `📢 *X9 INFORMA: CONFIGURAÇÕES*\n\n${usuario} mudou quem pode editar o grupo para: *${edit}*. O poder subiu à cabeça? ⚙️`
            break
        case 26: // Fechar/Abrir grupo
            let status = m.messageStubParameters[0] == 'on' ? 'fechou essa espelunca' : 'liberou a zona'
            text = `📢 *X9 INFORMA: STATUS*\n\nO(A) ${usuario} ${status}. Agora aguentem as consequências! 💬`
            break
        case 29: // Promover
            let novoAdmin = m.messageStubParameters[0]
            mentions.push(novoAdmin)
            text = `📢 *X9 INFORMA: PROMOÇÃO*\n\nInacreditável... @${novoAdmin.split('@')[0]} agora é ADM. \nNomeado por: ${usuario}. \n\n_Espero que saiba o que está fazendo._ 👑`
            break
        case 30: // Rebaixar
            let exAdmin = m.messageStubParameters[0]
            mentions.push(exAdmin)
            text = `📢 *X9 INFORMA: REBAIXAMENTO*\n\nJustiça feita! @${exAdmin.split('@')[0]} não é mais ADM. Foi rebaixado(a) a um simples plebeu por: ${usuario}. \n\n_Volte para o seu lugar!_ 📉`
            break
    }

    if (text) {
        await conn.sendMessage(m.chat, { text: text, mentions: mentions }, { quoted: m })
    }
}

handler.command = ['x9']
handler.group = true

export default handler