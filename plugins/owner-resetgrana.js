/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    // Validação dinâmica do dono baseada na global.owner do settings.js
    const sender = m.sender || m.key.participant || m.key.remoteJid || ''
    const senderLid = m.key.senderLid || ''
    const cleanSenderNum = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
    const cleanLidNum = senderLid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

    const ownerList = Array.isArray(global.owner) ? global.owner : []
    let isSoberano = m?.fromMe || m.isOwner || m.isROwner || false

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

    // Verificação de elite: Apenas o Soberano
    if (!isSoberano) return m.reply('*Apenas o Mestre Supremo Soberano tem autoridade para resetar a economia do grupo.* 🍷')

    let chat = global.db.data.chats[m.chat]
    
    if (!chat.users || Object.keys(chat.users).length === 0) {
        return m.reply('*Não há registros financeiros neste grupo para resetar.*')
    }

    // Pega todos os IDs de usuários que estão no banco deste grupo
    let users = Object.keys(chat.users)

    // Loop para zerar todo mundo
    users.forEach(jid => {
        chat.users[jid].coin = 0
        chat.users[jid].bank = 0
    })
    
    // Salva a limpeza no banco de dados
    if (global.db.write) await global.db.write()

    let texto = `
╭─〔 ⚔️ 𝙍𝙀𝙎𝙀𝙏 𝙂𝙀𝙍𝘼𝙇 𝘿𝙀𝘾𝙍𝙀𝙏𝘼𝘿𝙊 🍷 〕
│ 🏛️ *Grupo:* ${await conn.getName(m.chat)}
│ 👥 *Usuários afetados:* ${users.length}
│ 💸 *Saldo de todos:* R$ 0,00
│ 🏦 *Banco de todos:* R$ 0,00
╰─────────────────────
> O Soberano passou a régua! Todo mundo ficou pobre neste grupo.`.trim()

    await m.react('🧹')
    await conn.reply(m.chat, texto, m)
}

handler.help = ['resetargrana']
handler.tags = ['owner']
handler.command = ['resetgrana', 'limpargrana', 'zerar', 'resetargrana', 'zerartudo']
handler.group = true // Comando para ser usado em grupos
handler.rowner = true 

export default handler