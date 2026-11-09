/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
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

    // Apenas você (Soberano) tem permissão para abastecer a pasta
    if (!isSoberano) return

    // Verifica se você está respondendo a uma figurinha
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/webp/.test(mime)) return m.reply(`*Responda a uma figurinha com ${usedPrefix + command} para salvá-la.* 🤨`)

    try {
        await m.react('📥')
        
        // Caminho da sua pasta
        const dir = path.join(process.cwd(), 'figu')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)

        // Baixa a figurinha
        let media = await q.download()
        
        // Cria um nome único baseado no timestamp para não sobrescrever
        let fileName = `figu_${Date.now()}.webp`
        let filePath = path.join(dir, fileName)

        // Salva na pasta
        fs.writeFileSync(filePath, media)

        m.reply(`✅ *Figurinha salva com sucesso, Soberano!*\n\n📂 *Pasta:* /figu\n📄 *Arquivo:* ${fileName}\n\nAgora ela já faz parte do comando *${usedPrefix}fig*`)
    } catch (e) {
        console.error(e)
        m.reply('*Erro ao tentar salvar a figurinha.* ❌')
    }
}

handler.help = ['salvarfigu']
handler.tags = ['owner']
handler.command = ['salvarfigu', 'slv', 'salvar']
handler.rowner = true

export default handler