/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */
import fs from 'fs'
import path from 'path'
import { setGp } from '../handler.js'

let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Este comando só pode ser usado em grupos!')
    if (!isAdmin && !isOwner) return m.reply('❌ Apenas administradores podem usar este comando!')

    const dirGrupos = path.join(process.cwd(), 'src', 'database', 'grupos')
    if (!fs.existsSync(dirGrupos)) fs.mkdirSync(dirGrupos, { recursive: true })

    const cleanFrom = m.chat.split('@')[0] + '@g.us'
    const caminho = path.join(dirGrupos, `${cleanFrom}.json`)

    let jsonGp = []
    if (fs.existsSync(caminho)) {
        try {
            const content = fs.readFileSync(caminho, 'utf-8')
            jsonGp = content ? JSON.parse(content) : []
        } catch (e) { jsonGp = [] }
    }
    if (!Array.isArray(jsonGp)) jsonGp = []
    if (!jsonGp[0] || typeof jsonGp[0] !== 'object') jsonGp[0] = {}
    if (!jsonGp[0].antiroubo) jsonGp[0].antiroubo = { active: false, permitidos: [] }

    const args = (text || '').trim().split(/\s+/).filter(v => v)
    const sub = (args[0] || '').toLowerCase()

    if (sub === 'permitir' || sub === 'remover') {
        let alvoLid = null
        if (m.quoted && m.quoted.sender) {
            alvoLid = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            alvoLid = m.mentionedJid[0]
        }
        if (!alvoLid) return m.reply('❌ Marque ou responda quem deseja permitir/remover!')

        if (!jsonGp[0].antiroubo.permitidos) jsonGp[0].antiroubo.permitidos = []

        // Extrai apenas os dígitos numéricos do telefone para garantir validação universal (JID/LID)
        const numeroLimpo = alvoLid.split(':')[0].split('@')[0].replace(/\D/g, '')

        if (sub === 'permitir') {
            if (jsonGp[0].antiroubo.permitidos.includes(alvoLid) || jsonGp[0].antiroubo.permitidos.includes(numeroLimpo)) {
                return m.reply('⚠️ Essa pessoa já está na lista de permitidos!')
            }
            // Guarda o JID completo e o número limpo
            jsonGp[0].antiroubo.permitidos.push(alvoLid)
            if (numeroLimpo && !jsonGp[0].antiroubo.permitidos.includes(numeroLimpo)) {
                jsonGp[0].antiroubo.permitidos.push(numeroLimpo)
            }
            setGp(m.chat, jsonGp)
            return conn.sendMessage(m.chat, {
                text: `✅ @${numeroLimpo} agora pode promover/rebaixar sem ser revertido!`,
                mentions: [alvoLid]
            })
        } else {
            if (!jsonGp[0].antiroubo.permitidos.includes(alvoLid) && !jsonGp[0].antiroubo.permitidos.includes(numeroLimpo)) {
                return m.reply('⚠️ Essa pessoa não está na lista de permitidos!')
            }
            jsonGp[0].antiroubo.permitidos = jsonGp[0].antiroubo.permitidos.filter(x => x !== alvoLid && x !== numeroLimpo)
            setGp(m.chat, jsonGp)
            return conn.sendMessage(m.chat, {
                text: `✅ @${numeroLimpo} foi removido(a) da lista de permitidos.`,
                mentions: [alvoLid]
            })
        }
    }

    if (sub === 'on' || sub === '1') {
        if (jsonGp[0].antiroubo.active) return m.reply('⚠️ O anti-roubo já está ativado!')
        jsonGp[0].antiroubo.active = true
        setGp(m.chat, jsonGp)
        return m.reply('✅ *Anti-roubo ativado!* Promoções/rebaixamentos não autorizados serão revertidos.')
    } else if (sub === 'off' || sub === '0') {
        if (!jsonGp[0].antiroubo.active) return m.reply('⚠️ O anti-roubo já está desativado!')
        jsonGp[0].antiroubo.active = false
        setGp(m.chat, jsonGp)
        return m.reply('❌ *Anti-roubo desativado!*')
    } else {
        const status = jsonGp[0].antiroubo.active ? '🟢 Ligado' : '🔴 Desligado'
        return m.reply(`*🔒 CONFIGURAÇÃO DO ANTI-ROUBO 🔒*\n\nStatus: ${status}\n\nUse:\n*!antiroubo on* — ativar\n*!antiroubo off* — desativar\n*!antiroubo permitir* (marcando alguém) — libera pra promover/rebaixar\n*!antiroubo remover* (marcando alguém) — revoga a permissão`)
    }
}

handler.help = ['antiroubo']
handler.tags = ['group']
handler.command = ['antiroubo', 'antitheft']
handler.group = true
handler.admin = true

export default handler