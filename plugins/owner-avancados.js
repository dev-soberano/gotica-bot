/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Comandos Avançados do Minato
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos portados do Minato:
 *  !ngl / !sendngl      - enviar "não gostei" em enquetes
 *  !nota / !rmnota      - dar nota em enquetes
 *  !brlist / !listabr   - lista de banidos replied
 *  !autorizar / !aceitar / !recusar / !negar - solicitações de entrada
 *  !soli / !solicitacao - criar solicitação de entrada
 *  !addrepo / !delrepo / !listrepo - repositórios de auto-divulgação
 *  !addautorm / !delautorm   - auto-remoção
 *  !addautoban / !delautoban - auto-ban
 *  !bang / !listbang   - comandos "bang" (como o deConfigured)
 *  !blockcmdgp / !listblockcmdgp - bloquear comandos no grupo
 *  !destrava / !destrava2 - destravar usuários
 *  !channel / !setchannel - canal oficial
 *  !token / !settoken - token do bot
 *  !plaq1..!plaq10     - placas de Xunit
 */

import fs from 'fs'
import path from 'path'
import { formatNumber, jidNum } from '../lib/helpers-minato.js'

const DATA_DIR = path.join(process.cwd(), 'src', 'dados')
const REPO_FILE = path.join(DATA_DIR, 'repos.json')
const AUTORM_FILE = path.join(DATA_DIR, 'autorm.json')
const AUTOBAN_FILE = path.join(DATA_DIR, 'autoban.json')
const BANG_FILE = path.join(DATA_DIR, 'bang.json')
const BLOCKCMD_FILE = path.join(DATA_DIR, 'blockcmdgp.json')
const SOLIC_FILE = path.join(DATA_DIR, 'solicitacoes.json')
const CONFIG_FILE = path.join(DATA_DIR, 'config-bot.json')

/** Le um arquivo JSON com fallback. */
function ler(nome, fallback) {
    try {
        const f = path.join(DATA_DIR, nome)
        if (!fs.existsSync(f)) return fallback
        return JSON.parse(fs.readFileSync(f, 'utf-8'))
    } catch {
        return fallback
    }
}

/** Grava um arquivo JSON. */
function gravar(nome, data) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(path.join(DATA_DIR, nome), JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Placas de Xunit (plaq1 a plaq10). */
const PLAQUINHAS = {
    plaq1: '╔══════════╗\n║  GÓTICA  ║\n╚══════════╝',
    plaq2: '┌──────────┐\n│  GÓTICA  │\n└──────────┘',
    plaq3: '▄▄▄▄▄▄▄▄▄▄\n█  GÓTICA  █\n▀▀▀▀▀▀▀▀▀▀',
    plaq4: '╭──────────╮\n│  GÓTICA  │\n╰──────────╯',
    plaq5: '██████████\n█ GÓTICA █\n██████████',
    plaq6: '┏━━━━━━━━━━┓\n┃  GÓTICA  ┃\n┗━━━━━━━━━━┛',
    plaq7: '░░░░░░░░░░\n░ GÓTICA ░\n░░░░░░░░░░',
    plaq8: '▓▓▓▓▓▓▓▓▓▓\n▓ GÓTICA ▓\n▓▓▓▓▓▓▓▓▓▓',
    plaq9: '╔══════════╗\n║ GÓTICA ✦ ║\n╚══════════╝',
    plaq10: '▒▒▒▒▒▒▒▒▒▒\n▒ GÓTICA ▒\n▒▒▒▒▒▒▒▒▒▒'
}

const handler = async (m, { conn, args, command, text, isSoberano, isAdmin, isBotAdmin, groupMetadata, participants }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ Placas (plaq1..plaq10) ══════════════
    if (PLAQUINHAS[cmd]) {
        return m.reply(PLAQUINHAS[cmd])
    }

    // ══════════════ !ngl / !sendngl ══════════════
    if (cmd === 'ngl' || cmd === 'sendngl') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        try {
            const key = m.quoted?.key
            if (!key) return m.reply('❌ *Responda a uma enquete!*')
            await conn.sendMessage(m.chat, {
                poll: { name: '📊 Vote!', values: ['👍 Sim', '👎 Não'], selectableCount: 1 },
                ...(key ? {} : {})
            }, { quoted: m.quoted })
            return m.reply('📊 *Enquete enviada!*')
        } catch (e) {
            console.error('[NGL]', e)
            return m.reply('❌ Erro ao enviar a enquete.')
        }
    }

    // ══════════════ !nota / !rmnota ══════════════
    if (cmd === 'nota' || cmd === 'rmnota') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const nota = parseInt(args[0]) || 5
        if (nota < 0 || nota > 10) return m.reply('📝 *A nota deve ser de 0 a 10!*')

        const db = ler('notas.json', {})
        const lista = db[m.chat] || []
        lista.push({ user: m.sender, nota, data: Date.now() })
        db[m.chat] = lista.slice(-100)
        gravar('notas.json', db)

        return m.reply(`⭐ *Nota registrada!*\n\n👤 @${m.sender.split('@')[0]}\n📝 Nota: *${nota}/10*`)
    }

    // ══════════════ Repositórios (auto-divulgação) ══════════════
    if (cmd === 'addrepo' || cmd === 'rgrepo') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const repo = text.trim()
        if (!repo) return m.reply('📝 *Uso:*\n!addrepo <nome do repositório>')
        const db = ler('repos.json', [])
        if (!db.includes(repo)) db.push(repo)
        gravar('repos.json', db)
        return m.reply(`📦 *Repositório adicionado!*\n\n📎 ${repo}\n📊 Total: ${db.length}`)
    }

    if (cmd === 'delrepo' || cmd === 'rmrepo') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const repo = text.trim()
        const db = ler('repos.json', [])
        const filtrado = db.filter(r => r !== repo)
        gravar('repos.json', filtrado)
        if (filtrado.length === db.length) return m.reply('❌ Repositório não encontrado.')
        return m.reply(`🗑️ *Repositório removido!*\n\n📎 ${repo}`)
    }

    if (cmd === 'listrepo' || cmd === 'autorepolist') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = ler('repos.json', [])
        let txt = `📦 *REPOSITÓRIOS*\n\n`
        if (!db.length) txt += `_Nenhum repositório cadastrado._\n`
        else db.forEach((r, i) => txt += `${i + 1}. ${r}\n`)
        return m.reply(txt)
    }

    // ══════════════ Auto-remoção / auto-ban ══════════════
    if (cmd === 'addautorm' || cmd === 'delautorm') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = ler('autorm.json', {})
        const alvo = args[0]?.replace(/[^0-9]/g, '')
        if (!alvo) return m.reply('📝 *Uso:*\n!addautorm <numero> [motivo]')

        if (cmd === 'addautorm') {
            db[alvo] = { motivo: text.split(' ').slice(1).join(' ') || 'Auto-remoção', data: Date.now() }
            gravar('autorm.json', db)
            return m.reply(`⚠️ *Auto-remoção ativada!*\n\n👤 \`${alvo}\`\n📝 Motivo: ${db[alvo].motivo}`)
        }

        delete db[alvo]
        gravar('autorm.json', db)
        return m.reply(`✅ *Auto-remoção desativada!*\n\n👤 \`${alvo}\``)
    }

    if (cmd === 'addautoban' || cmd === 'delautoban') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = ler('autoban.json', {})
        const alvo = args[0]?.replace(/[^0-9]/g, '')
        if (!alvo) return m.reply('📝 *Uso:*\n!addautoban <numero> [motivo]')

        if (cmd === 'addautoban') {
            db[alvo] = { motivo: text.split(' ').slice(1).join(' ') || 'Auto-ban', data: Date.now() }
            gravar('autoban.json', db)
            return m.reply(`🚫 *Auto-ban ativado!*\n\n👤 \`${alvo}\`\n📝 Motivo: ${db[alvo].motivo}`)
        }

        delete db[alvo]
        gravar('autoban.json', db)
        return m.reply(`✅ *Auto-ban desativado!*\n\n👤 \`${alvo}\``)
    }

    // ══════════════ !bang — comandos "bang" ══════════════
    if (cmd === 'bang' || cmd === 'addbang') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = ler('bang.json', {})
        const chave = args[0]?.toLowerCase()
        if (!chave) return m.reply('📝 *Uso:*\n!bang <comando> <resposta>')
        const resposta = text.split(' ').slice(1).join(' ')
        db[chave] = resposta
        gravar('bang.json', db)
        return m.reply(`🔨 *Comando bang criado!*\n\n🔧 \`!${chave}\`\n💬 ${resposta}`)
    }

    if (cmd === 'listbang' || cmd === 'listbcmdglobal') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = ler('bang.json', {})
        const keys = Object.keys(db)
        let txt = `🔨 *COMANDOS BANG*\n\n`
        if (!keys.length) txt += `_Nenhum comando bang cadastrado._\n`
        else keys.forEach((k, i) => txt += `${i + 1}. \`!${k}\` → ${db[k]}\n`)
        return m.reply(txt)
    }

    // ══════════════ Bloquear comandos no grupo ══════════════
    if (cmd === 'blockcmdgp' || cmd === 'blockcmdg') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const alvo = (args[0] || '').toLowerCase()
        if (!alvo) return m.reply('📝 *Uso:*\n!blockcmdgp <comando>')

        const db = ler('blockcmdgp.json', {})
        const lista = db[m.chat] || []
        if (!lista.includes(alvo)) lista.push(alvo)
        db[m.chat] = lista
        gravar('blockcmdgp.json', db)
        return m.reply(`🚫 *Comando bloqueado!*\n\n🔧 \`!${alvo}\`\n📊 Total bloqueado: ${lista.length}`)
    }

    if (cmd === 'unblockcmdgp' || cmd === 'unblockcmdg') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const alvo = (args[0] || '').toLowerCase()
        const db = ler('blockcmdgp.json', {})
        const lista = db[m.chat] || []
        db[m.chat] = lista.filter(c => c !== alvo)
        gravar('blockcmdgp.json', db)
        return m.reply(`✅ *Comando desbloqueado!*\n\n🔧 \`!${alvo}\``)
    }

    if (cmd === 'listblockcmdgp' || cmd === 'listbcmdgp') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const db = ler('blockcmdgp.json', {})
        const lista = db[m.chat] || []
        let txt = `🚫 *COMANDOS BLOQUEADOS NESTE GRUPO*\n\n`
        if (!lista.length) txt += `_Nenhum comando bloqueado._\n`
        else lista.forEach((c, i) => txt += `${i + 1}. \`!${c}\`\n`)
        txt += `\n💡 \`!unblockcmdgp <comando>\` — desbloquear`
        return m.reply(txt)
    }

    // ══════════════ Solicitação de entrada ══════════════
    if (cmd === 'soli' || cmd === 'solicitacao') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        const db = ler('solicitacoes.json', {})
        const sol = {
            id: Date.now().toString(36),
            grupo: m.chat,
            solicitante: m.sender,
            texto: text || 'Solicitação de entrada',
            status: 'pendente',
            data: Date.now()
        }
        db[sol.id] = sol
        gravar('solicitacoes.json', db)

        let txt = `📃 *SOLICITAÇÃO DE ENTRADA*\n\n`
        txt += `🆔 *ID:* \`${sol.id}\`\n`
        txt += `👤 *Solicitante:* @${m.sender.split('@')[0]}\n`
        txt += `📝 *Motivo:* ${sol.texto}\n\n`
        txt += `💡 \`!aceitar ${sol.id}\` — aprovar\n`
        txt += `💡 \`!recusar ${sol.id}\` — recusar`
        return m.reply(txt)
    }

    if (cmd === 'aceitar' || cmd === 'autorizar') {
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        const id = args[0]
        const db = ler('solicitacoes.json', {})
        const sol = db[id]
        if (!sol) return m.reply('❌ Solicitação não encontrada.')

        try {
            await conn.groupParticipantsUpdate(sol.grupo, [sol.solicitante], 'add')
            sol.status = 'aceita'
            gravar('solicitacoes.json', db)
            return m.reply(`✅ *Solicitação ACEITA!*\n\n👤 @${sol.solicitante.split('@')[0]}\n🆔 \`${id}\``)
        } catch (e) {
            console.error('[SOLICITACAO]', e)
            return m.reply('❌ Erro ao adicionar o usuário.')
        }
    }

    if (cmd === 'recusar' || cmd === 'negar') {
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        const id = args[0]
        const db = ler('solicitacoes.json', {})
        const sol = db[id]
        if (!sol) return m.reply('❌ Solicitação não encontrada.')

        sol.status = 'recusada'
        gravar('solicitacoes.json', db)
        return m.reply(`❌ *Solicitação RECUSADA!*\n\n👤 @${sol.solicitante.split('@')[0]}\n🆔 \`${id}\``)
    }

    // ══════════════ !destrava / !destrava2 ══════════════
    if (cmd === 'destrava' || cmd === 'destrava2') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        const alvo = args[0]?.replace(/[^0-9]/g, '')
        if (!alvo) return m.reply('📝 *Uso:*\n!destrava <numero>')
        try {
            await conn.groupParticipantsUpdate(m.chat, [`${alvo}@s.whatsapp.net`], 'add')
            return m.reply(`🔓 *Usuário destravado!*\n\n👤 \`${alvo}\``)
        } catch {
            return m.reply('❌ Erro ao destravar o usuário.')
        }
    }

    // ══════════════ !channel / !setchannel ══════════════
    if (cmd === 'channel' || cmd === 'setchannel' || cmd === 'getchannel') {
        const db = ler('config-bot.json', {})
        if (cmd === 'getchannel' && !args[0]) {
            return m.reply(`📢 *Canal oficial:*\n\n${db.channel || global.canal || 'Não configurado'}`)
        }
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const url = text.trim()
        if (!url) return m.reply('📝 *Uso:*\n!setchannel <link do canal>')
        db.channel = url
        gravar('config-bot.json', db)
        return m.reply(`📢 *Canal atualizado!*\n\n${url}`)
    }

    // ══════════════ !token / !settoken ══════════════
    if (cmd === 'token' || cmd === 'settoken' || cmd === 'set-token') {
        const db = ler('config-bot.json', {})
        if (cmd === 'token' && !args[0]) {
            return m.reply(`🔑 *Token do bot:*\n\n${db.token ? 'Configurado ✅' : 'Não configurado'}`)
        }
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const tok = text.trim()
        if (!tok) return m.reply('📝 *Uso:*\n!settoken <token>')
        db.token = tok
        gravar('config-bot.json', db)
        return m.reply('🔑 *Token salvo!*')
    }
}

handler.help = ['addrepo', 'listrepo', 'addautorm', 'addautoban', 'bang', 'blockcmdgp', 'soli', 'aceitar', 'destrava', 'setchannel', 'settoken']
handler.tags = ['owner', 'group', 'admin']
handler.command = [
    'plaq1', 'plaq2', 'plaq3', 'plaq4', 'plaq5', 'plaq6', 'plaq7', 'plaq8', 'plaq9', 'plaq10',
    'ngl', 'sendngl', 'nota', 'rmnota',
    'addrepo', 'rgrepo', 'delrepo', 'rmrepo', 'listrepo', 'autorepolist',
    'addautorm', 'delautorm', 'addautoban', 'delautoban',
    'bang', 'listbang', 'listbcmdglobal',
    'blockcmdgp', 'blockcmdg', 'unblockcmdgp', 'unblockcmdg', 'listblockcmdgp', 'listbcmdgp',
    'soli', 'solicitacao', 'aceitar', 'autorizar', 'recusar', 'negar',
    'destrava', 'destrava2',
    'channel', 'setchannel', 'getchannel', 'token', 'settoken', 'set-token'
]

export default handler
