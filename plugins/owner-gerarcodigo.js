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

    // Apenas você (Soberano) pode gerar códigos
    if (!isSoberano) return

    let [nome, valor] = text.split('|')
    if (!nome || !valor) return m.reply(`*Exemplo:* ${usedPrefix + command} PIX100 | 100`)

    if (!global.db.data.codes) global.db.data.codes = {}
    
    let codigoFormatado = nome.trim().toUpperCase()
    let valorRecompensa = parseInt(valor.trim())

    if (isNaN(valorRecompensa)) return m.reply('*O valor deve ser um número, Soberano!* ❌')

    // Cria o código com a propriedade 'singleUse'
    global.db.data.codes[codigoFormatado] = {
        coin: valorRecompensa,
        claimedBy: [],
        singleUse: true // Define que é uso único
    }

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    m.reply(`✅ *CÓDIGO EXCLUSIVO GERADO*\n\n🎫 *Código:* ${codigoFormatado}\n💰 *Valor:* ${formatar(valorRecompensa)}\n⚠️ *Aviso:* Apenas a primeira pessoa que usar poderá resgatar!`)
}

handler.command = ['gerarcodigo', 'setcode']
handler.rowner = true 

export default handler