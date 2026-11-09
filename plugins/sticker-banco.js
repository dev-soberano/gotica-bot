/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Banco de Figurinhas
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de figurinhas salvas, portado do Minato:
 *  !listfig / !figlist - lista as figurinhas salvas
 *  !delfig <id>        - remove uma figurinha
 *  !rgfig <termo>      - busca figurinha por termo
 *  !cmdfig <comando>   - figurinha vinculada a um comando
 *
 * Nota: !salvarfigu ja existe na base (plugins/owner-salvarfigu.js).
 */

import { delFig, readFigs } from '../lib/helpers-minato.js'
import fs from 'fs'
import path from 'path'

const CMDFIG_FILE = path.join(process.cwd(), 'src', 'dados', 'cmdfig.json')

/** Le o mapeamento comando -> figurinha. */
function readCmdFig() {
    try {
        if (!fs.existsSync(CMDFIG_FILE)) return {}
        const p = JSON.parse(fs.readFileSync(CMDFIG_FILE, 'utf-8'))
        return (p && typeof p === 'object') ? p : {}
    } catch {
        return {}
    }
}

/** Grava o mapeamento comando -> figurinha. */
function writeCmdFig(data) {
    try {
        const dir = path.dirname(CMDFIG_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(CMDFIG_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

const handler = async (m, { conn, args, command, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !listfig / !figlist ----------
    if (cmd === 'listfig' || cmd === 'figlist' || cmd === 'listafig' || cmd === 'figuras') {
        const figs = readFigs()
        if (!figs.length) {
            return m.reply('📦 *BANCO DE FIGURINHAS*\n\n📭 Nenhuma figurinha salva ainda.\n\n💡 Use `!salvarfigu` respondendo a uma figurinha.')
        }

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  📦 *BANCO DE FIGURINHAS*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `📊 *Total:* ${figs.length}\n\n`

        figs.slice(0, 20).forEach((f, i) => {
            const quando = new Date(f.createdAt || Date.now()).toLocaleDateString('pt-BR')
            txt += `${i + 1}. 🆔 \`${f.id}\` — ${f.name || 'sem nome'} _(${quando})_\n`
        })

        if (figs.length > 20) txt += `\n_... e mais ${figs.length - 20} figurinha(s)_`
        txt += `\n\n💡 \`!rgfig <termo>\` — buscar`
        return m.reply(txt)
    }

    // ---------- !rgfig <termo> ----------
    if (cmd === 'rgfig' || cmd === 'buscarfig' || cmd === 'procurarfig') {
        if (!args[0]) return m.reply('📝 *Uso:*\n!rgfig <termo>\n\n*Exemplo:* `!rgfig gato`')
        const termo = args.join(' ').toLowerCase()
        const figs = readFigs().filter(f => (f.name || '').toLowerCase().includes(termo))

        if (!figs.length) return m.reply(`📭 Nenhuma figurinha encontrada para "${termo}".`)

        const f = figs[0]
        const buffer = Buffer.from(f.buffer, 'base64')
        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.reply(`🆔 *ID:* \`${f.id}\`\n👤 ${f.name || 'sem nome'}\n📊 *Encontradas:* ${figs.length}`)
    }

    // ---------- !delfig <id> ----------
    if (cmd === 'delfig' || cmd === 'removerfig' || cmd === 'rmfig') {
        if (!args[0]) return m.reply('📝 *Uso:*\n!delfig <id>\n\n*Exemplo:* `!delfig 123456`')
        const ok = delFig(args[0])
        if (!ok) return m.reply('❌ Figurinha não encontrada.')
        return m.reply(`🗑️ *Figurinha removida!*\n\n🆔 \`${args[0]}\``)
    }

    // ---------- !cmdfig <comando> ----------
    if (cmd === 'cmdfig' || cmd === 'comandofig' || cmd === 'comandosfig') {
        if (!args[0]) {
            const all = readCmdFig()
            const keys = Object.keys(all)
            if (!keys.length) return m.reply('📋 *Nenhum comando com figurinha vinculada.*')
            let txt = `📋 *COMANDOS COM FIGURINHA*\n\n`
            keys.forEach(k => txt += `• \`!${k}\`\n`)
            return m.reply(txt)
        }

        const nome = args[0].toLowerCase()
        const all = readCmdFig()
        if (!all[nome]) return m.reply(`❌ Nenhuma figurinha vinculada ao comando \`!${nome}\`.`)

        const figs = readFigs()
        const f = figs.find(x => String(x.id) === String(all[nome]))
        if (!f) return m.reply('❌ Figurinha não encontrada no banco.')

        const buffer = Buffer.from(f.buffer, 'base64')
        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
    }
}

handler.help = ['listfig', 'delfig', 'rgfig', 'cmdfig']
handler.tags = ['sticker', 'fig']
handler.command = ['listfig', 'figlist', 'listafig', 'figuras',
    'rgfig', 'buscarfig', 'procurarfig', 'delfig', 'removerfig', 'rmfig',
    'cmdfig', 'comandofig', 'comandosfig']

export default handler
