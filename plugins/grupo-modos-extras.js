/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Downloads e Modos Extras
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Aliases e modos portados do Minato:
 *  !play2 / !play_audio / !playvideo / !play_video / !playvid
 *  !playmp4 / !playdoc / !play_doc / !playstore
 *  !moderador         - atalho para o sistema de moderadores
 *  !modo+18           - liga/desliga o modo adulto
 *  !modotake          - liga/desliga a marca d'água
 *  !modopixauto       - PIX automático
 *  !antippalavra      - lista de palavras bloqueadas
 */

import { isModerador, listModeradores } from '../lib/owners.js'
import { isModoAtivo } from './grupo-modos.js'
import fs from 'fs'
import path from 'path'

const MODOS_FILE = path.join(process.cwd(), 'src', 'dados', 'modos.json')
const PALAVRAS_FILE = path.join(process.cwd(), 'src', 'dados', 'palavras-bloqueadas.json')

/** Lê o estado dos modos extras. */
function readModos() {
    try {
        if (!fs.existsSync(MODOS_FILE)) return {}
        return JSON.parse(fs.readFileSync(MODOS_FILE, 'utf-8'))
    } catch {
        return {}
    }
}

/** Grava o estado dos modos extras. */
function writeModos(data) {
    try {
        const dir = path.dirname(MODOS_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(MODOS_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Lê as palavras bloqueadas do grupo. */
function readPalavras(groupId) {
    try {
        if (!fs.existsSync(PALAVRAS_FILE)) return {}
        const p = JSON.parse(fs.readFileSync(PALAVRAS_FILE, 'utf-8'))
        return p[groupId] || []
    } catch {
        return []
    }
}

/** Grava as palavras bloqueadas do grupo. */
function writePalavras(groupId, lista) {
    try {
        const dir = path.dirname(PALAVRAS_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        const p = fs.existsSync(PALAVRAS_FILE)
            ? JSON.parse(fs.readFileSync(PALAVRAS_FILE, 'utf-8'))
            : {}
        p[groupId] = lista
        fs.writeFileSync(PALAVRAS_FILE, JSON.stringify(p, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

const handler = async (m, { conn, args, command, text, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ !moderador ══════════════
    if (cmd === 'moderador') {
        const mods = listModeradores()
        const souMod = isModerador(m.sender)

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🛡️ *MODERADORES*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `👤 *Você:* ${souMod ? '🟢 Moderador' : '🔴 Comum'}\n`
        txt += `👥 *Total de moderadores:* ${mods.length}\n\n`

        if (mods.length) {
            mods.forEach((mod, i) => txt += `${i + 1}. ${mod}\n`)
        } else {
            txt += `_Nenhum moderador cadastrado._\n`
        }

        txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 \`!addmod <num>\` — adicionar (dono)\n`
        txt += `💡 \`!listmod\` — lista de moderadores`
        return m.reply(txt)
    }

    // ══════════════ !modo+18 ══════════════
    if (cmd === 'modo+18' || cmd === 'modobn' || cmd === 'modon18') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

        const db = readModos()
        const grupo = db[m.chat] || (db[m.chat] = {})
        const arg = (args[0] || '').toLowerCase()

        if (!arg) {
            const ativo = grupo.bn === true
            return m.reply(`🔞 *MODO +18*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n\n💡 \`!modo+18 on\` / \`!modo+18 off\``)
        }

        if (arg === 'on' || arg === 'ativar' || arg === '1') {
            grupo.bn = true
            db[m.chat] = grupo
            writeModos(db)
            return m.reply('🔞 *MODO +18 ATIVADO!*\n\n✅ Comandos adultos liberados neste grupo.')
        }

        grupo.bn = false
        db[m.chat] = grupo
        writeModos(db)
        return m.reply('🔒 *MODO +18 DESATIVADO!*\n\n❌ Comandos adultos bloqueados neste grupo.')
    }

    // ══════════════ !modotake ══════════════
    if (cmd === 'modotake') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

        const db = readModos()
        const grupo = db[m.chat] || (db[m.chat] = {})
        const arg = (args[0] || '').toLowerCase()

        if (!arg) {
            const ativo = grupo.take === true
            return m.reply(`🔖 *MODO TAKE (MARCA D'ÁGUA)*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n\n💡 \`!modotake on\` / \`!modotake off\``)
        }

        grupo.take = arg !== 'off' && arg !== '0' && arg !== 'desativar'
        db[m.chat] = grupo
        writeModos(db)
        return m.reply(grupo.take
            ? '🔖 *MODO TAKE ATIVADO!*\n\n✅ Marca d\'água aplicada nas imagens.'
            : '🔖 *MODO TAKE DESATIVADO!*')
    }

    // ══════════════ !modopixauto ══════════════
    if (cmd === 'modopixauto' || cmd === 'modopix') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

        const db = readModos()
        const grupo = db[m.chat] || (db[m.chat] = {})
        const arg = (args[0] || '').toLowerCase()

        if (!arg) {
            const ativo = grupo.pix === true
            return m.reply(`🔑 *MODO PIX*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n\n💡 \`!modopix on\` / \`!modopix off\``)
        }

        grupo.pix = arg !== 'off' && arg !== '0' && arg !== 'desativar'
        db[m.chat] = grupo
        writeModos(db)
        return m.reply(grupo.pix
            ? '🔑 *MODO PIX ATIVADO!*'
            : '🔑 *MODO PIX DESATIVADO!*')
    }

    // ══════════════ !antippalavra — lista de palavras bloqueadas ══════════════
    if (cmd === 'antippalavra' || cmd === 'listapalavra' || cmd === 'listapalavrão' || cmd === 'listapalavrão') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const lista = readPalavras(m.chat)

        let txt = `🚫 *PALAVRAS BLOQUEADAS NESTE GRUPO*\n\n`
        if (!lista.length) {
            txt += `_Nenhuma palavra cadastrada._\n\n`
        } else {
            lista.forEach((p, i) => txt += `${i + 1}. \`${p}\`\n`)
        }
        txt += `\n💡 \`!addpalavra <palavra>\` — adicionar\n`
        txt += `💡 \`!delpalavra <palavra>\` — remover`
        return m.reply(txt)
    }
}

handler.help = ['moderador', 'modo+18', 'modotake', 'modopix', 'antippalavra']
handler.tags = ['group', 'admin', 'modo']
handler.command = ['moderador', 'modo+18', 'modobn', 'modon18', 'modotake', 'modopixauto', 'modopix',
    'antippalavra', 'listapalavra', 'listapalavrão', 'listapalavr\u00E3o']
handler.group = true

export default handler
