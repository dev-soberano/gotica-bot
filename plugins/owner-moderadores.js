/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Sistema de Moderadores
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !addmod <numero>  - adiciona moderador global
 *  !rmmod <numero>   - remove moderador
 *  !listmod          - lista moderadores
 *  !modmode on|off   - liga/desliga o modo moderador
 */

import { addModerador, removeModerador, listModeradores, jidNum, isModerador } from '../lib/owners.js'
import fs from 'fs'
import path from 'path'

const MODE_FILE = path.join(process.cwd(), 'src', 'dados', 'modmode.json')

/** Lê o estado do modo moderador. */
function readModMode() {
    try {
        if (!fs.existsSync(MODE_FILE)) return { active: false }
        const p = JSON.parse(fs.readFileSync(MODE_FILE, 'utf-8'))
        return { active: !!p.active }
    } catch {
        return { active: false }
    }
}

/** Grava o estado do modo moderador. */
function writeModMode(state) {
    try {
        const dir = path.dirname(MODE_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(MODE_FILE, JSON.stringify(state, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

const handler = async (m, { args, command, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // !modmode on|off
    if (cmd === 'modmode' || cmd === 'modomoderador' || cmd === 'modo_moderador') {
        const state = readModMode()
        const arg = (args[0] || '').toLowerCase()

        if (!arg) {
            return m.reply(`🎛️ *MODO MODERADOR*\n\n📊 Estado: ${state.active ? '🟢 *ATIVO*' : '🔴 *INATIVO*'}\n\n💡 \`!modmode on\` / \`!modmode off\``)
        }

        if (arg === 'on' || arg === 'ativar' || arg === '1') {
            writeModMode({ active: true })
            return m.reply(`✅ *Modo moderador ativado!*\n\nAgora apenas *donos, moderadores e admins* podem usar comandos restritos.`)
        }

        if (arg === 'off' || arg === 'desativar' || arg === '0') {
            writeModMode({ active: false })
            return m.reply(`✅ *Modo moderador desativado!*\n\nTodos os usuários voltam a ter acesso normal.`)
        }

        return m.reply('📝 *Uso:*\n`!modmode on` — ativar\n`!modmode off` — desativar')
    }

    // !addmod <numero>
    if (cmd === 'addmod' || cmd === 'add_mod' || cmd === 'addmoderador') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!addmod <numero>\n\n*Exemplo:* \`!addmod 554299441624\``)

        const res = addModerador(args[0])
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`✅ *Moderador adicionado!*\n\n📱 ${args[0]}\n🔗 \`${res.jid}\`\n\n💡 Use \`!modmode on\` para ativar o modo moderador.`)
    }

    // !rmmod <numero>
    if (cmd === 'rmmod' || cmd === 'rm_mod' || cmd === 'removemoderador') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!rmmod <numero>\n\n*Exemplo:* \`!rmmod 554299441624\``)

        const res = removeModerador(args[0])
        if (!res.ok) return m.reply('❌ Esse usuário não é um moderador.')
        return m.reply(`🗑️ *Moderador removido!*\n\n📱 ${args[0]}`)
    }

    // !listmod
    if (cmd === 'listmod' || cmd === 'listamod' || cmd === 'lista_mod' || cmd === 'mods') {
        const mods = listModeradores()
        const state = readModMode()

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🛡️ *MODERADORES*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `📊 *Modo moderador:* ${state.active ? '🟢 ATIVO' : '🔴 INATIVO'}\n`
        txt += `👥 *Total:* ${mods.length}\n\n`

        if (mods.length) {
            mods.forEach((mod, i) => txt += `${i + 1}. ${mod}\n`)
        } else {
            txt += `_Nenhum moderador cadastrado._\n`
        }

        txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 \`!addmod <num>\` — adicionar\n`
        txt += `💡 \`!rmmod <num>\` — remover`
        return m.reply(txt)
    }
}

handler.help = ['addmod', 'rmmod', 'listmod', 'modmode']
handler.tags = ['owner']
handler.command = ['addmod', 'add_mod', 'addmoderador', 'rmmod', 'rm_mod', 'removemoderador',
    'listmod', 'listamod', 'lista_mod', 'mods', 'modmode', 'modomoderador', 'modo_moderador']
handler.owner = true

export default handler
