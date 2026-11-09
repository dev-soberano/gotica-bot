/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Subbots & Autopromo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de subbots e divulgação automática portado do Minato:
 *  !addsub <jid> <prefixo>  - registra um subbot
 *  !delsub <jid>           - remove um subbot
 *  !listsub                - lista subbots
 *  !prefixsub <jid> <p>    - muda o prefixo do subbot
 *  !subbot on|off          - liga/desliga os subbots
 *
 *  !autodivul on|off       - liga a divulgação automática
 *  !rg_divul               - registra um grupo para divulgar
 *  !rm_divul <jid>         - remove um grupo da divulgação
 *  !lista_divul            - lista grupos de divulgação
 *  !tempo_divul            - intervalo da divulgação
 *  !rg_group <jid> <msg>   - mensagem de divulgação de um grupo
 *  !rm_group <jid>         - remove a mensagem do grupo
 */

import fs from 'fs'
import path from 'path'
import { jidNum } from '../lib/owners.js'

const DATA_DIR = path.join(process.cwd(), 'src', 'dados')
const SUB_FILE = path.join(DATA_DIR, 'subbots.json')
const DIVUL_FILE = path.join(DATA_DIR, 'divulgacao.json')

/** Lê os subbots. */
function readSubs() {
    try {
        if (!fs.existsSync(SUB_FILE)) return { ativos: true, lista: [] }
        const p = JSON.parse(fs.readFileSync(SUB_FILE, 'utf-8'))
        return { ativos: p.ativos !== false, lista: Array.isArray(p.lista) ? p.lista : [] }
    } catch {
        return { ativos: true, lista: [] }
    }
}

/** Grava os subbots. */
function writeSubs(data) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(SUB_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Lê a configuração de divulgação. */
function readDivul() {
    try {
        if (!fs.existsSync(DIVUL_FILE)) return { ativo: false, grupos: {}, destinos: [], intervalo: 60, mensagemPadrao: '' }
        const p = JSON.parse(fs.readFileSync(DIVUL_FILE, 'utf-8'))
        return {
            ativo: !!p.ativo,
            grupos: p.grupos || {},
            destinos: Array.isArray(p.destinos) ? p.destinos : [],
            intervalo: p.intervalo || 60,
            mensagemPadrao: p.mensagemPadrao || ''
        }
    } catch {
        return { ativo: false, grupos: {}, destinos: [], intervalo: 60, mensagemPadrao: '' }
    }
}

/** Grava a configuração de divulgação. */
function writeDivul(data) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(DIVUL_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

const handler = async (m, { conn, args, command, text, isSoberano, groupMetadata }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ SUBBOTS ══════════════
    if (cmd === 'addsub') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        const prefixo = args[1] || '!'
        if (!jid) return m.reply('📝 *Uso:*\n!addsub <jid> [prefixo]\n\n*Exemplo:* `!addsub 554299441624 @`')
        const db = readSubs()
        if (!db.lista.some(s => s.jid === jid)) {
            db.lista.push({ jid, prefixo, criadoEm: Date.now() })
            writeSubs(db)
        }
        return m.reply(`✅ *Subbot registrado!*\n\n🆔 \`${jid}\`\n🔤 Prefixo: \`${prefixo}\`\n\n💡 Use \`!subbot on\` para ativar.`)
    }

    if (cmd === 'delsub' || cmd === 'remsub' || cmd === 'rmsub') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        if (!jid) return m.reply('📝 *Uso:*\n!delsub <jid>')
        const db = readSubs()
        const before = db.lista.length
        db.lista = db.lista.filter(s => s.jid !== jid)
        writeSubs(db)
        if (db.lista.length === before) return m.reply('❌ Subbot não encontrado.')
        return m.reply(`🗑️ *Subbot removido!*\n\n🆔 \`${jid}\``)
    }

    if (cmd === 'listsub' || cmd === 'listsubs') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readSubs()
        let txt = `🤖 *SUBBOTS*\n\n`
        txt += `📊 *Estado:* ${db.ativos ? '🟢 ATIVO' : '🔴 INATIVO'}\n`
        txt += `👥 *Total:* ${db.lista.length}\n\n`
        db.lista.forEach((s, i) => {
            txt += `${i + 1}. \`${s.jid}\` — prefixo \`${s.prefixo}\`\n`
        })
        if (!db.lista.length) txt += `_Nenhum subbot registrado._`
        return m.reply(txt)
    }

    if (cmd === 'prefixsub' || cmd === 'setprefixsub') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        const prefixo = args[1]
        if (!jid || !prefixo) return m.reply('📝 *Uso:*\n!prefixsub <jid> <prefixo>')
        const db = readSubs()
        const sub = db.lista.find(s => s.jid === jid)
        if (!sub) return m.reply('❌ Subbot não encontrado.')
        sub.prefixo = prefixo
        writeSubs(db)
        return m.reply(`✅ *Prefixo atualizado!*\n\n🆔 \`${jid}\`\n🔤 Prefixo: \`${prefixo}\``)
    }

    if (cmd === 'subbot') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readSubs()
        const arg = (args[0] || '').toLowerCase()
        if (arg === 'on' || arg === 'ativar' || arg === '1') {
            db.ativos = true
            writeSubs(db)
            return m.reply('🟢 *Subbots ATIVADOS!*\n\nTodos os subbots registrados voltarão a responder.')
        }
        if (arg === 'off' || arg === 'desativar' || arg === '0') {
            db.ativos = false
            writeSubs(db)
            return m.reply('🔴 *Subbots DESATIVADOS!*\n\nNenhum subbot responderá até reativar.')
        }
        return m.reply(`🤖 *SUBBOTS*\n\n📊 Estado: ${db.ativos ? '🟢 ATIVO' : '🔴 INATIVO'}\n👥 Total: ${db.lista.length}\n\n💡 \`!subbot on\` / \`!subbot off\``)
    }

    // ══════════════ AUTOPROMO ══════════════
    if (cmd === 'autodivul') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readDivul()
        const arg = (args[0] || '').toLowerCase()
        if (arg === 'on' || arg === 'ativar' || arg === '1') {
            db.ativo = true
            writeDivul(db)
            return m.reply(`📢 *AUTOPROMO ATIVADO!*\n\n⏱️ Intervalo: ${db.intervalo} min\n📍 Destinos: ${db.destinos.length}`)
        }
        if (arg === 'off' || arg === 'desativar' || arg === '0') {
            db.ativo = false
            writeDivul(db)
            return m.reply('🔕 *AUTOPROMO DESATIVADO!*')
        }
        return m.reply(`📢 *AUTOPROMO*\n\n📊 Estado: ${db.ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n⏱️ Intervalo: ${db.intervalo} min\n📍 Destinos: ${db.destinos.length}`)
    }

    if (cmd === 'rg_divul' || cmd === 'adddivul') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        if (!jid) return m.reply('📝 *Uso:*\n!rg_divul <jid do grupo>')
        const db = readDivul()
        if (!db.destinos.includes(jid)) {
            db.destinos.push(jid)
            writeDivul(db)
        }
        return m.reply(`✅ *Grupo adicionado à divulgação!*\n\n📍 \`${jid}\`\n📊 Total: ${db.destinos.length}`)
    }

    if (cmd === 'rm_divul' || cmd === 'deldivul') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        if (!jid) return m.reply('📝 *Uso:*\n!rm_divul <jid do grupo>')
        const db = readDivul()
        const before = db.destinos.length
        db.destinos = db.destinos.filter(g => g !== jid)
        writeDivul(db)
        if (db.destinos.length === before) return m.reply('❌ Grupo não encontrado.')
        return m.reply(`🗑️ *Grupo removido da divulgação!*\n\n📊 Restantes: ${db.destinos.length}`)
    }

    if (cmd === 'lista_divul' || cmd === 'listdivul') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readDivul()
        let txt = `📢 *GRUPOS DE DIVULGAÇÃO*\n\n`
        txt += `📊 *Estado:* ${db.ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n`
        txt += `👥 *Total:* ${db.destinos.length}\n\n`
        db.destinos.forEach((g, i) => txt += `${i + 1}. \`${g}\`\n`)
        if (!db.destinos.length) txt += `_Nenhum grupo cadastrado._`
        return m.reply(txt)
    }

    if (cmd === 'tempo_divul' || cmd === 'intervalodivul') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readDivul()
        const min = parseInt(args[0])
        if (!min || min < 5) {
            return m.reply(`📝 *Uso:*\n!tempo_divul <minutos>\n\n*Mínimo: 5 minutos*\n\n📊 Atual: ${db.intervalo} min`)
        }
        db.intervalo = min
        writeDivul(db)
        return m.reply(`⏱️ *Intervalo atualizado!*\n\n📊 Novo intervalo: ${min} minutos`)
    }

    if (cmd === 'rg_group' || cmd === 'addgroup') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        if (!jid) return m.reply('📝 *Uso:*\n!rg_group <jid> <mensagem>')
        const db = readDivul()
        db.grupos[jid] = text.split(' ').slice(1).join(' ') || db.mensagemPadrao
        writeDivul(db)
        return m.reply(`✅ *Mensagem do grupo salva!*\n\n🆔 \`${jid}\`\n💬 ${db.grupos[jid] || '(vazio)'}`)
    }

    if (cmd === 'rm_group' || cmd === 'delgroup') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const jid = args[0]
        if (!jid) return m.reply('📝 *Uso:*\n!rm_group <jid>')
        const db = readDivul()
        if (!(jid in db.grupos)) return m.reply('❌ Grupo não encontrado.')
        delete db.grupos[jid]
        writeDivul(db)
        return m.reply(`🗑️ *Mensagem removida!*\n\n🆔 \`${jid}\``)
    }
}

handler.help = ['addsub', 'delsub', 'listsub', 'prefixsub', 'subbot', 'autodivul', 'rg_divul', 'rm_divul', 'lista_divul', 'tempo_divul']
handler.tags = ['owner', 'divul']
handler.command = ['addsub', 'delsub', 'remsub', 'rmsub', 'listsub', 'listsubs', 'prefixsub', 'setprefixsub',
    'subbot', 'autodivul', 'rg_divul', 'adddivul', 'rm_divul', 'deldivul', 'lista_divul', 'listdivul',
    'tempo_divul', 'intervalodivul', 'rg_group', 'addgroup', 'rm_group', 'delgroup']
handler.owner = true

export default handler
