/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗       ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣       ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩       ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import path from 'path'
import { getAllOwners } from '../lib/owners.js'

let handler = async (m, { conn, usedPrefix, command, args, isAdmin, isOwner, isSoberano }) => {
    // 🛡️ Validação da Cúpula da Gótica (Soberano, Donos e ADMs do Grupo)
    const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
    const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
    const isAnyOwner = isOwner || isSoberano || m?.fromMe || allOwners.includes(senderNum)

    if (!isAdmin && !isAnyOwner) return global.dfail('admin', m, conn)

    if (!m.isGroup) return m.reply('✨ ❌ *Este comando só pode ser usado em grupos.*')

    // 1. Atualiza na memória runtime do bot (global.db.data)
    let chat = global.db.data.chats[m.chat]
    if (!chat) chat = global.db.data.chats[m.chat] = {}

    let state = args[0] ? args[0].toLowerCase() : ''

    // Caminho exato do arquivo JSON individual do grupo
    const gruposDir = path.join(process.cwd(), 'src', 'database', 'grupos')
    const grupoFilePath = path.join(gruposDir, `${m.chat}.json`)

    // Lê o JSON local do grupo (se existir) para preservar outras configurações
    let groupConfig = {}
    try {
        if (fs.existsSync(grupoFilePath)) {
            groupConfig = JSON.parse(fs.readFileSync(grupoFilePath, 'utf-8'))
        }
    } catch (err) {
        console.error(`[MODOREAL] Erro ao ler JSON do grupo ${m.chat}:`, err)
    }

    if (state === 'on' || state === '1') {
        chat.modoreal = true
        groupConfig.modoreal = true
        
        // Grava fisicamente no disco (HD/SSD)
        salvarConfigGrupo(gruposDir, grupoFilePath, groupConfig)

        return m.reply(`✅ *MODO REAL ATIVADO!*\n*A economia está liberada neste grupo e foi salva permanentemente.* 🍷`)

    } else if (state === 'off' || state === '0') {
        chat.modoreal = false
        groupConfig.modoreal = false

        // Grava fisicamente no disco (HD/SSD)
        salvarConfigGrupo(gruposDir, grupoFilePath, groupConfig)

        return m.reply(`⚠️ *MODO REAL DESATIVADO!*\n*A farra do dinheiro acabou.* 🍷`)

    } else {
        return m.reply(`*Soberano, use ${usedPrefix + command} on ou off.*`)
    }
}

/** Função auxiliar para gravar no JSON sem corromper o diretório */
function salvarConfigGrupo(dir, filePath, data) {
    try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) {
        console.error(`[MODOREAL] Erro ao gravar arquivo JSON do grupo:`, e)
    }
}

handler.help = ['modoreal']
handler.tags = ['admin']
handler.command = ['modoreal']
handler.group = true

export default handler