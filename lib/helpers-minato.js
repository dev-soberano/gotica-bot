/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Helpers Compartilhados
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Utilitários usados por vários plugins portados do Minato:
 * sistema de level/XP, rankings, playlists, comandos extras,
 * anti-spam de grupo e formatação.
 */

import fs from 'fs'
import path from 'path'
import { jidNormalizedUser } from '@whiskeysockets/baileys'

const DATA_DIR = path.join(process.cwd(), 'src', 'dados')

// ═══════════════════════════════════════════════════════════
// SISTEMA DE LEVEL / XP
// ═══════════════════════════════════════════════════════════

const LEVEL_FILE = path.join(DATA_DIR, 'levels.json')

/** Patentes por nível (estilo Minato). */
export const PATENTES = [
    { min: 0, nome: 'Novato' },
    { min: 5, nome: 'Iniciante' },
    { min: 10, nome: 'Aprendiz' },
    { min: 20, nome: 'Aventureiro' },
    { min: 30, nome: 'Veterano' },
    { min: 45, nome: 'Elite' },
    { min: 60, nome: 'Mestre' },
    { min: 80, nome: 'Lenda' },
    { min: 100, nome: 'Soberano' },
    { min: 130, nome: 'Imortal' },
    { min: 170, nome: 'Divino' }
]

/** Retorna a patente correspondente a um XP. */
export function pegarPatente(xp) {
    let atual = PATENTES[0]
    for (const p of PATENTES) {
        if (xp >= p.min) atual = p
    }
    return atual
}

/** XP necessário para o próximo nível. */
export function xpParaProximoNivel(level) {
    return Math.floor(50 + Math.pow(level, 1.5) * 12)
}

/** XP necessário para alcançar um nível. */
export function xpParaNivel(level) {
    if (level <= 1) return 0
    return Math.floor(50 * Math.pow(level - 1, 1.5) + 30 * (level - 1))
}

/** Lê a base de levels. */
export function readLevels() {
    try {
        if (!fs.existsSync(LEVEL_FILE)) return { users: {}, groups: {} }
        const p = JSON.parse(fs.readFileSync(LEVEL_FILE, 'utf-8'))
        return {
            users: p.users || {},
            groups: p.groups || {}
        }
    } catch {
        return { users: {}, groups: {} }
    }
}

/** Grava a base de levels. */
export function writeLevels(data) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(LEVEL_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** XP calculado por nível. */
function calcLevel(xp) {
    let level = 1
    while (xp >= xpParaNivel(level + 1)) level++
    return level
}

/** Retorna (ou cria) o registro de level de um usuário num grupo. */
export function getUserLevel(groupId, userId) {
    const db = readLevels()
    const g = db.groups[groupId] || (db.groups[groupId] = {})
    if (!g[userId]) {
        g[userId] = { xp: 0, level: 1, name: '' }
        writeLevels(db)
    }
    return g[userId]
}

/** Adiciona XP a um usuário e retorna info de level up. */
export function addXP(groupId, userId, amount, name = '') {
    const db = readLevels()
    const g = db.groups[groupId] || (db.groups[groupId] = {})
    const u = g[userId] || (g[userId] = { xp: 0, level: 1, name: '' })

    const oldLevel = u.level
    u.xp += amount
    u.level = calcLevel(u.xp)
    if (name) u.name = name

    writeLevels(db)

    return {
        xp: u.xp,
        level: u.level,
        oldLevel,
        leveledUp: u.level > oldLevel,
        patente: pegarPatente(u.xp),
        falta: xpParaProximoNivel(u.level) - u.xp
    }
}

/** Lista usuários de um grupo ordenados por XP. */
export function usuariosLevel(groupId) {
    const db = readLevels()
    const g = db.groups[groupId] || {}
    return Object.entries(g).map(([id, u]) => ({
        id,
        nick: u.name || id.split('@')[0],
        xp: u.xp || 0,
        level: u.level || 1
    }))
}

/** Lista usuários de TODOS os grupos ordenados por XP. */
export function usuariosLevelGlobal() {
    const db = readLevels()
    const mapa = new Map()
    for (const g of Object.values(db.groups || {})) {
        for (const [id, u] of Object.entries(g || {})) {
            const atual = mapa.get(id)
            const xp = u.xp || 0
            if (!atual || xp > atual.xp) {
                mapa.set(id, { id, nick: u.name || id.split('@')[0], xp, level: u.level || 1 })
            }
        }
    }
    return [...mapa.values()]
}

/** Bloqueia um grupo do sistema de level. */
export function blockLevel(groupId) {
    const db = readLevels()
    db.blocked = db.blocked || []
    if (!db.blocked.includes(groupId)) db.blocked.push(groupId)
    writeLevels(db)
}

/** Desbloqueia um grupo do sistema de level. */
export function unblockLevel(groupId) {
    const db = readLevels()
    db.blocked = (db.blocked || []).filter(g => g !== groupId)
    writeLevels(db)
}

/** Verifica se o grupo está bloqueado para level. */
export function isLevelBlocked(groupId) {
    const db = readLevels()
    return (db.blocked || []).includes(groupId)
}

// ═══════════════════════════════════════════════════════════
// RANKINGS
// ═══════════════════════════════════════════════════════════

/**
 * Monta o texto de um ranking.
 * @param {Array} items  [{nick, value, extra}]
 * @param {string} title
 * @param {string} valueLabel
 */
export function buildRanking(items, title, valueLabel = 'XP', emoji = '🏆') {
    let txt = `╭─ *Gótica Bot 💁‍♂️*\n`
    txt += `│ ${emoji} *${title}*\n`
    txt += `╰──────────────────\n`

    if (!items.length) {
        txt += `\n_📭 Ninguém aparece neste ranking ainda._\n`
    } else {
        items.forEach((u, i) => {
            txt += `\n▸ *#${i + 1} • ${u.nick}*\n`
            txt += `╰─〔 ${valueLabel} ${u.value} 〕\n`
            if (u.extra) txt += `╰─〔 ${u.extra} 〕\n`
        })
    }

    txt += `──────────────────\n`
    txt += `- *✨ Os usuários mais ativos do bot 🙇‍♂️*`
    return txt
}

// ═══════════════════════════════════════════════════════════
// COMANDOS EXTRAS (custom commands)
// ═══════════════════════════════════════════════════════════

const CMDS_FILE = path.join(DATA_DIR, 'customcmds.json')

/** Lê os comandos extras cadastrados. */
export function readCustomCmds() {
    try {
        if (!fs.existsSync(CMDS_FILE)) return []
        const p = JSON.parse(fs.readFileSync(CMDS_FILE, 'utf-8'))
        return Array.isArray(p) ? p : []
    } catch {
        return []
    }
}

/** Grava os comandos extras. */
export function writeCustomCmds(list) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(CMDS_FILE, JSON.stringify(list, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Cadastra um comando extra (dono). */
export function addCustomCmd(cmd, response, owner = false) {
    const list = readCustomCmds()
    const c = String(cmd).toLowerCase().trim()
    const idx = list.findIndex(x => x.cmd === c)
    const entry = { cmd: c, response, owner: !!owner, createdAt: Date.now() }
    if (idx >= 0) list[idx] = entry
    else list.push(entry)
    writeCustomCmds(list)
    return entry
}

/** Remove um comando extra. */
export function delCustomCmd(cmd) {
    const list = readCustomCmds()
    const c = String(cmd).toLowerCase().trim()
    const filtered = list.filter(x => x.cmd !== c)
    writeCustomCmds(filtered)
    return filtered.length < list.length
}

/** Lista comandos extras. */
export function listCustomCmds() {
    return readCustomCmds()
}

/** Busca um comando extra pelo nome. */
export function getCustomCmd(cmd) {
    const c = String(cmd).toLowerCase().trim()
    return readCustomCmds().find(x => x.cmd === c) || null
}

// ═══════════════════════════════════════════════════════════
// NO-PREFIX (comandos sem prefixo)
// ═══════════════════════════════════════════════════════════

const NOPREFIX_FILE = path.join(DATA_DIR, 'noprefix.json')

/** Lê a lista de comandos sem prefixo. */
export function readNoPrefix() {
    try {
        if (!fs.existsSync(NOPREFIX_FILE)) return []
        const p = JSON.parse(fs.readFileSync(NOPREFIX_FILE, 'utf-8'))
        return Array.isArray(p) ? p : []
    } catch {
        return []
    }
}

/** Grava a lista de comandos sem prefixo. */
export function writeNoPrefix(list) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(NOPREFIX_FILE, JSON.stringify(list, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Adiciona um comando à lista sem prefixo. */
export function addNoPrefix(cmd) {
    const c = String(cmd).toLowerCase().trim()
    const list = readNoPrefix()
    if (list.includes(c)) return false
    list.push(c)
    writeNoPrefix(list)
    return true
}

/** Remove um comando da lista sem prefixo. */
export function delNoPrefix(cmd) {
    const c = String(cmd).toLowerCase().trim()
    const list = readNoPrefix()
    const filtered = list.filter(x => x !== c)
    writeNoPrefix(filtered)
    return filtered.length < list.length
}

// ═══════════════════════════════════════════════════════════
// FIGURINHAS (figuras)
// ═══════════════════════════════════════════════════════════

const FIGS_FILE = path.join(DATA_DIR, 'figuras.json')

/** Lê as figurinhas salvas. */
export function readFigs() {
    try {
        if (!fs.existsSync(FIGS_FILE)) return []
        const p = JSON.parse(fs.readFileSync(FIGS_FILE, 'utf-8'))
        return Array.isArray(p) ? p : []
    } catch {
        return []
    }
}

/** Grava as figurinhas salvas. */
export function writeFigs(list) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(FIGS_FILE, JSON.stringify(list, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Salva uma figurinha. */
export function addFig(entry) {
    const list = readFigs()
    list.unshift({ id: Date.now(), ...entry })
    writeFigs(list.slice(0, 500))
    return list
}

/** Remove uma figurinha pelo id. */
export function delFig(id) {
    const list = readFigs()
    const filtered = list.filter(f => String(f.id) !== String(id))
    writeFigs(filtered)
    return filtered.length < list.length
}

// ═══════════════════════════════════════════════════════════
// UTILIDADES GERAIS
// ═══════════════════════════════════════════════════════════

/** Formata um número com separadores de milhar. */
export function formatNumber(num) {
    return Number(num || 0).toLocaleString('pt-BR')
}

/** Embaralha um array. */
export function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/** Retorna um item aleatório. */
export function pickRandom(arr) {
    if (!arr || !arr.length) return null
    return arr[Math.floor(Math.random() * arr.length)]
}

/** Converte segundos em "1h 2m 3s". */
export function secondsToString(secs) {
    const s = Math.floor(secs % 60)
    const m = Math.floor((secs / 60) % 60)
    const h = Math.floor(secs / 3600)
    let out = ''
    if (h) out += `${h}h `
    if (m) out += `${m}m `
    out += `${s}s`
    return out.trim()
}

/** Normaliza um JID para o formato do WhatsApp. */
export function normalize(jid) {
    if (!jid) return ''
    try {
        return jidNormalizedUser(String(jid))
    } catch {
        const raw = String(jid).trim()
        if (raw.includes('@')) return raw
        const num = raw.replace(/[^0-9]/g, '')
        return num ? `${num}@s.whatsapp.net` : ''
    }
}

/** Extrai o número de um JID. */
export function jidNum(jid) {
    return String(jid || '').replace(/[^0-9]/g, '')
}
