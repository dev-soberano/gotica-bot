/**
 * @project Gótica Bot - Sistema de Donos / Moderadores / VIP / Permissões
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Este módulo centraliza toda a hierarquia de permissões do bot,
 * inspirado no sistema do Minato Bot (dono1..dono6), porém com
 * persistência em JSON e fallback para o `global.owner` legado.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'src', 'dados')
const OWNERS_FILE = path.join(DATA_DIR, 'owners.json')

/**
 * Estrutura padrão do arquivo de donos.
 * - donos:       lista de 6 donos (dono1..dono6) - o slot 1 é o soberano principal
 * - moderadores: usuários promoted a moderador global
 * - vips:        usuários premium
 * - permissoes: permissoes extras concedidas por grupo
 */
const DEFAULT_DATA = {
    donos: ['', '', '', '', '', ''],
    moderadores: [],
    vips: [],
    permissoes: {},
    gruposDono: {},
    bloqueados: []
}

/**
 * Extrai e limpa perfeitamente o número de um JID/número (removendo LIDs e DDIs duplicados).
 */
export function jidNum(jid) {
    if (!jid) return ''
    const raw = String(jid)
    
    // Se for um LID longo do WhatsApp, tenta extrair os dígitos do final se possível ou retorna limpo
    if (raw.includes('@lid')) {
        const cleanLid = raw.split('@')[0].replace(/[^0-9]/g, '')
        return cleanLid.length > 11 ? cleanLid.slice(-11) : cleanLid
    }

    let num = raw.replace(/[^0-9]/g, '')
    if (!num) return ''

    // Normalização rigorosa de DDI duplicado (ex: 5556391096656 -> 556391096656)
    if (num.length > 13 && num.startsWith('55')) {
        const semPrimeiro55 = num.slice(2)
        if (semPrimeiro55.length >= 11 && semPrimeiro55.length <= 13) {
            num = semPrimeiro55
        }
    }

    return num
}

/** Normaliza um número para o formato com @s.whatsapp.net. */
export function normalizeJid(jid) {
    if (!jid) return ''
    const raw = String(jid).trim()
    if (raw.includes('@')) return raw
    const num = raw.replace(/[^0-9]/g, '')
    return num ? `${num}@s.whatsapp.net` : ''
}

/**
 * Lê o arquivo de donos do disco. Nunca lança: em caso de erro
 * devolve a estrutura padrão para o bot continuar funcionando.
 */
export function readOwners() {
    try {
        if (!fs.existsSync(OWNERS_FILE)) {
            ensureOwnersDir()
            fs.writeFileSync(OWNERS_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8')
            return structuredClone(DEFAULT_DATA)
        }
        const parsed = JSON.parse(fs.readFileSync(OWNERS_FILE, 'utf-8'))
        return {
            donos: Array.isArray(parsed.donos) && parsed.donos.length >= 6
                ? parsed.donos.slice(0, 6)
                : [...DEFAULT_DATA.donos],
            moderadores: Array.isArray(parsed.moderadores) ? parsed.moderadores : [],
            vips: Array.isArray(parsed.vips) ? parsed.vips : [],
            permissoes: (parsed.permissoes && typeof parsed.permissoes === 'object') ? parsed.permissoes : {},
            gruposDono: (parsed.gruposDono && typeof parsed.gruposDono === 'object') ? parsed.gruposDono : {},
            bloqueados: Array.isArray(parsed.bloqueados) ? parsed.bloqueados : []
        }
    } catch (e) {
        console.error('[OWNERS] Erro ao ler donos.json:', e.message)
        return structuredClone(DEFAULT_DATA)
    }
}

/** Garante que o diretório de dados exista. */
function ensureOwnersDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch { }
}

/** Grava o arquivo de donos no disco. */
export function writeOwners(data) {
    try {
        ensureOwnersDir()
        fs.writeFileSync(OWNERS_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (e) {
        console.error('[OWNERS] Erro ao gravar donos.json:', e.message)
        return false
    }
}

/**
 * Retorna a lista de todos os JIDs considered dono.
 * Combina os donos do JSON com o `global.owner` legado do settings.js.
 */
export function getAllOwners() {
    const data = readOwners()
    const list = new Set()

    for (const d of data.donos) {
        const j = normalizeJid(d)
        if (j) list.add(j)
    }

    // Fallback / legado: global.owner do settings.js
    const legacy = Array.isArray(global.owner) ? global.owner : []
    for (const entry of legacy) {
        const raw = Array.isArray(entry) ? entry[0] : entry
        const j = normalizeJid(raw)
        if (j) list.add(j)
    }

    return [...list]
}

/** Retorna os 6 donos em ordem (dono1..dono6). */
export function getDonoSlots() {
    const data = readOwners()
    return data.donos.map((d, i) => ({
        slot: i + 1,
        nome: `dono${i + 1}`,
        jid: normalizeJid(d),
        num: jidNum(d),
        definido: !!normalizeJid(d)
    }))
}

/** Define um dono em um slot (1..6). */
export function setDono(slot, jid) {
    const data = readOwners()
    const idx = Number(slot) - 1
    if (idx < 0 || idx > 5) return { ok: false, msg: 'Slot inválido. Use de 1 a 6.' }
    const j = normalizeJid(jid)
    if (!j) return { ok: false, msg: 'Número/JID inválido.' }
    data.donos[idx] = j
    writeOwners(data)
    return { ok: true, jid: j, slot: idx + 1 }
}

/** Remove o dono de um slot. */
export function removeDono(slot) {
    const data = readOwners()
    const idx = Number(slot) - 1
    if (idx < 0 || idx > 5) return { ok: false, msg: 'Slot inválido. Use de 1 a 6.' }
    const old = data.donos[idx]
    data.donos[idx] = ''
    writeOwners(data)
    return { ok: true, removed: old }
}

/** Verifica se o JID é o soberano (dono1) ou um dos donos. */
export function isDono(jid) {
    const num = jidNum(jid)
    if (!num) return false
    return getAllOwners().some(o => jidNum(o) === num)
}

/** Verifica se o JID é especificamente o soberano principal (dono1). */
export function isSoberano(jid) {
    const num = jidNum(jid)
    if (!num) return false
    const data = readOwners()
    const d1 = jidNum(data.donos[0])
    if (d1 && d1 === num) return true
    // fallback legado: primeiro dono do global.owner
    const legacy = Array.isArray(global.owner) ? global.owner : []
    if (legacy.length && jidNum(legacy[0]?.[0]) === num) return true
    return false
}

/** Verifica se o JID é moderador global. */
export function isModerador(jid) {
    const num = jidNum(jid)
    if (!num) return false
    const data = readOwners()
    return data.moderadores.some(m => jidNum(m) === num)
}

/** Adiciona um moderador global. */
export function addModerador(jid) {
    const data = readOwners()
    const j = normalizeJid(jid)
    if (!j) return { ok: false, msg: 'Número inválido.' }
    if (data.moderadores.some(m => jidNum(m) === jidNum(j)))
        return { ok: false, msg: 'Esse usuário já é moderador.' }
    data.moderadores.push(j)
    writeOwners(data)
    return { ok: true, jid: j }
}

/** Remove um moderador global. */
export function removeModerador(jid) {
    const data = readOwners()
    const num = jidNum(jid)
    const before = data.moderadores.length
    data.moderadores = data.moderadores.filter(m => jidNum(m) !== num)
    writeOwners(data)
    return { ok: data.moderadores.length < before, jid: normalizeJid(jid) }
}

/** Lista todos os moderadores. */
export function listModeradores() {
    return readOwners().moderadores.map(normalizeJid).filter(Boolean)
}

/** Verifica se o JID é VIP. */
export function isVip(jid) {
    const num = jidNum(jid)
    if (!num) return false
    return readOwners().vips.some(v => jidNum(v) === num)
}

/** Adiciona um VIP. */
export function addVip(jid) {
    const data = readOwners()
    const j = normalizeJid(jid)
    if (!j) return { ok: false, msg: 'Número inválido.' }
    if (data.vips.some(v => jidNum(v) === jidNum(j)))
        return { ok: false, msg: 'Esse usuário já é VIP.' }
    data.vips.push(j)
    writeOwners(data)
    return { ok: true, jid: j }
}

/** Remove um VIP. */
export function removeVip(jid) {
    const data = readOwners()
    const num = jidNum(jid)
    const before = data.vips.length
    data.vips = data.vips.filter(v => jidNum(v) !== num)
    writeOwners(data)
    return { ok: data.vips.length < before, jid: normalizeJid(jid) }
}

/** Lista todos os VIPs. */
export function listVips() {
    return readOwners().vips.map(normalizeJid).filter(Boolean)
}

/**
 * Verifica se o JID tem uma permissão extra em um grupo.
 * @param {string} jid
 * @param {string} groupId
 * @param {string} perm  nome da permissão (ex: 'dono')
 */
export function hasPermissao(jid, groupId, perm) {
    const num = jidNum(jid)
    if (!num || !groupId) return false
    const data = readOwners()
    const g = data.permissoes[groupId]
    if (!g || !Array.isArray(g[perm])) return false
    return g[perm].some(p => jidNum(p) === num)
}

/** Concede uma permissão em um grupo. */
export function addPermissao(groupId, jid, perm = 'dono') {
    const data = readOwners()
    const j = normalizeJid(jid)
    if (!j) return { ok: false, msg: 'Número inválido.' }
    if (!data.permissoes[groupId]) data.permissoes[groupId] = {}
    if (!Array.isArray(data.permissoes[groupId][perm])) data.permissoes[groupId][perm] = []
    if (!data.permissoes[groupId][perm].some(p => jidNum(p) === jidNum(j))) {
        data.permissoes[groupId][perm].push(j)
    }
    writeOwners(data)
    return { ok: true, jid: j, groupId, perm }
}

/** Revoga uma permissão de um grupo. */
export function removePermissao(groupId, jid, perm = 'dono') {
    const data = readOwners()
    const num = jidNum(jid)
    const g = data.permissoes[groupId]
    if (!g || !Array.isArray(g[perm])) return { ok: false, msg: 'Permissão não encontrada.' }
    const before = g[perm].length
    g[perm] = g[perm].filter(p => jidNum(p) !== num)
    writeOwners(data)
    return { ok: g[perm].length < before }
}

/** Lista as permissões de um grupo. */
export function listPermissoes(groupId) {
    const data = readOwners()
    const g = data.permissoes[groupId]
    if (!g) return {}
    return g
}

/** Marca um grupo como "grupo do dono" (painel dePermissões do dono). */
export function marcarGrupoDono(groupId, jid) {
    const data = readOwners()
    const j = normalizeJid(jid)
    data.gruposDono[groupId] = j
    writeOwners(data)
    return { ok: true }
}

/** Lista os grupos gerenciados por um dono. */
export function listGruposDono(jid) {
    const data = readOwners()
    const num = jidNum(jid)
    return Object.entries(data.gruposDono)
        .filter(([, owner]) => jidNum(owner) === num)
        .map(([gid]) => gid)
}

/** Verifica se o JID está na blacklist global de comandos. */
export function isBloqueado(jid) {
    const num = jidNum(jid)
    if (!num) return false
    return readOwners().bloqueados.some(b => jidNum(b) === num)
}

/** Bloqueia um usuário globalmente. */
export function addBloqueado(jid) {
    const data = readOwners()
    const j = normalizeJid(jid)
    if (!j) return { ok: false, msg: 'Número inválido.' }
    if (!data.bloqueados.some(b => jidNum(b) === jidNum(j))) data.bloqueados.push(j)
    writeOwners(data)
    return { ok: true, jid: j }
}

/** Desbloqueia um usuário globalmente. */
export function removeBloqueado(jid) {
    const data = readOwners()
    const num = jidNum(jid)
    const before = data.bloqueados.length
    data.bloqueados = data.bloqueados.filter(b => jidNum(b) !== num)
    writeOwners(data)
    return { ok: data.bloqueados.length < before }
}

/**
 * Verificação completa de permissão de um usuário numa mensagem.
 * Retorna um objeto com todos os flags.
 */
export function checkPermission(m, { groupId, isGroupAdmin, isBotAdmin, participants }) {
    const sender = m?.sender
    const num = jidNum(sender)
    const fromMe = !!m?.fromMe

    const dono = fromMe || isDono(sender)
    const soberano = fromMe || isSoberano(sender)
    const moderador = dono || isModerador(sender)
    const vip = isVip(sender)
    const bloqueado = !dono && isBloqueado(sender)

    let permissaoDonoGp = false
    if (groupId) {
        permissaoDonoGp = !dono && hasPermissao(sender, groupId, 'dono')
    }

    return {
        dono,
        soberano,
        moderador,
        vip,
        bloqueado,
        permissaoDonoGp,
        admin: isGroupAdmin,
        botAdmin: isBotAdmin,
        num,
        podeModerar: dono || moderador || permissaoDonoGp || isGroupAdmin,
        podeDono: dono || soberano
    }
}