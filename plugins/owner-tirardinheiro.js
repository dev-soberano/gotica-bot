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
        return m.reply(`✨ 🚫 *Acesso negado!* Apenas o Mestre Supremo Soberano pode confiscar bens. 🍷`)
    }

    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat

    if (!who) return m.reply(`✨ ⚠️ *Soberano, você precisa mencionar ou responder a mensagem do "criminoso".*`)

    let valor = parseInt(args[0])
    if (isNaN(valor) || valor <= 0) return m.reply(`✨ ❌ *Valor inválido.* Use: ${usedPrefix + command} 100 @membro`)

    let chat = global.db.data.chats[m.chat]
    
    // Inicializa o usuário no banco de dados do grupo se não existir
    if (!chat.users) chat.users = {}
    if (!chat.users[who]) chat.users[who] = { coin: 0, bank: 0 }

    // Remove o saldo (Garante que não fique negativo se não houver saldo suficiente)
    if (chat.users[who].coin < valor) {
        chat.users[who].coin = 0 
    } else {
        chat.users[who].coin -= valor
    }

    let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let texto = `
┏━━⏤͟͟͞͞★꙲⃝͟📉 *CONFISCO REAL*
┃
┃ 📉 *Valor Removido:* ${formatarReal(valor)}
┃ 🎯 *Alvo:* @${who.split('@')[0]}
┃ 📉 *Saldo Restante:* ${formatarReal(chat.users[who].coin)}
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟💸❈┉━━━━┛`.trim()

    await m.react('📉')
    await conn.reply(m.chat, texto, m, { mentions: [who] })
}

handler.help = ['tirardinheiro <valor> @user']
handler.tags = ['owner']
handler.command = ['tirardinheiro', 'removergrana', 'confiscar']
handler.rowner = true 

export default handler