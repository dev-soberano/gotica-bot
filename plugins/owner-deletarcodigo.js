/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    // Apenas você (Soberano) pode deletar
    if (!isSoberano) return

    if (!text) return m.reply(`*Qual código você deseja matar?*\nExemplo: *${usedPrefix + command} PIX100*`)

    let code = text.trim().toUpperCase()
    let codesDB = global.db.data.codes || {}

    if (!codesDB[code]) {
        return m.reply(`*O código ${code} não existe ou já foi deletado.* 🤷‍♂️`)
    }

    // Mata o código removendo-o do banco de dados
    delete global.db.data.codes[code]

    m.reply(`✅ *Código "${code}" foi exterminado com sucesso!* Ninguém mais pode resgatá-lo. 💀`)
}

handler.help = ['deletarcodigo']
handler.tags = ['owner']
handler.command = ['deletarcodigo', 'delcode', 'matarcodigo']
handler.rowner = true

export default handler