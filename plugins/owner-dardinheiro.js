/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Validação dinâmica do dono baseada na global.owner do settings.js
    const sender = m.sender || m.key.participant || m.key.remoteJid || ''
    const senderLid = m.key.senderLid || ''
    const cleanSenderNum = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
    const cleanLidNum = senderLid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

    const ownerList = Array.isArray(global.owner) ? global.owner : []
    let isSoberano = m?.fromMe || m.isOwner || false

    if (!isSoberano) {
        for (const entry of ownerList) {
            const ownerId = String(entry[0] || '').trim()
            if (!ownerId) continue
            const ownerDigits = ownerId.replace(/[^0-9]/g, '')
            if (ownerDigits && (cleanSenderNum === ownerDigits || cleanLidNum === ownerDigits || sender.includes(ownerId) || senderLid.includes(ownerId))) {
                isSoberano = true
                break
            }
        }
    }

    if (!isSoberano) {
        return m.reply(`✨ 🚫 *Quem você pensa que é?* Esse comando é só para meu dono *Soberano* 😎🔥`)
    }

    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat

    if (!who) return m.reply(`✨ ⚠️ *Você deve mencionar ou responder a mensagem da pessoa.*`)

    let valor = parseInt(args[0])
    if (isNaN(valor) || valor <= 0) return m.reply(`✨ ❌ *Valor inválido.* Use: ${usedPrefix + command} 100 @membro`)

    let chat = global.db.data.chats[m.chat]
    
    // Inicializa o usuário no banco de dados do grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[who]) chat.users[who] = { coin: 0, bank: 0 }

    // Adiciona o saldo
    chat.users[who].coin += valor

    let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let texto = `
┏━━⏤͟͟͞͞★꙲⃝͟👑 *PODER DO DONO*
┃
┃ 💰 *Valor Adicionado:* ${formatarReal(valor)}
┃ 🎯 *Destinatário:* @${who.split('@')[0]}
┃ 📈 *Novo Saldo:* ${formatarReal(chat.users[who].coin)}
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟✨❈┉━━━━┛`.trim()

    await m.react('💸')
    await conn.reply(m.chat, texto, m, { mentions: [who] })
}

handler.help = ['dardinheiro <valor> @user']
handler.tags = ['owner']
handler.command = ['dardinheiro','addmoney', 'gerar']
handler.rowner = true // Reforço para garantir que só o dono use

export default handler