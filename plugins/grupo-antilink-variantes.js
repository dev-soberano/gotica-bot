/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Anti-Link Avançado
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Variantes de anti-link portadas do Minato:
 *  !antilinkhard   - bloqueia QUALQUER link (inclusive domínios legítimos)
 *  !antilinkeasy   - bloqueia apenas links de convite de grupos/canais
 *  !anticatalogo   - bloqueia links de catálogo
 *  !antilar        - bloqueia links de compartilhamento de status
 *  !antiligar      - bloqueia links de "clique aqui" / rastreamento
 *
 * Funciona em conjunto com plugins/_antilink.js e plugins/_antilink2.js
 * que já existem na base da Gótica.
 */

import fs from 'fs'
import path from 'path'

const ANTI_FILE = path.join(process.cwd(), 'src', 'dados', 'antilink.json')

/** Padrões de link bloqueados por modo. */
const PADROES = {
    antilinkhard: {
        nome: 'Anti-Link Rígido',
        descricao: 'Bloqueia QUALQUER link',
        regex: /\bhttps?:\/\/\S+|\bwww\.\S+|\b\S+\.(com|net|org|io|co|br|me|xyz|top|cc|site|link|app)\b\S*/gi,
        excluir: []
    },
    antilinkeasy: {
        nome: 'Anti-Link Leve',
        descricao: 'Bloqueia apenas convites de grupo/canal',
        regex: /chat\.whatsapp\.com\/\S+|whatsapp\.com\/channel\/\S+|wa\.me\/\S+/gi,
        excluir: []
    },
    anticatalogo: {
        nome: 'Anti-Catálogo',
        descricao: 'Bloqueia links de catálogo',
        regex: /catalog\?.*|catalog_message\?.*|wa\.me\/\d+\?.*catalog/gi,
        excluir: []
    },
    antilar: {
        nome: 'Anti-Lar',
        descricao: 'Bloqueia links de status (wa.me/p/...)',
        regex: /wa\.me\/p\/\S+|web\.whatsapp\.com\/status\S*/gi,
        excluir: []
    },
    antiligacao: {
        nome: 'Anti-Ligação',
        descricao: 'Bloqueia links de rastreamento e clique',
        regex: /wa\.me\/\d+\/\S+|chat\.whatsapp\.com\S*\?.*|t\.me\S*/gi,
        excluir: []
    }
}

/** Le as configurações de anti-link por grupo. */
function readAnti() {
    try {
        if (!fs.existsSync(ANTI_FILE)) return {}
        const p = JSON.parse(fs.readFileSync(ANTI_FILE, 'utf-8'))
        return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {}
    } catch {
        return {}
    }
}

/** Grava as configurações de anti-link por grupo. */
function writeAnti(data) {
    try {
        const dir = path.dirname(ANTI_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(ANTI_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/**
 * Plugin `before`: aplica o anti-link configurado no grupo.
 */
export async function before(m, { conn, groupMetadata, isSoberano }) {
    if (!m.isGroup) return
    if (m.fromMe || isSoberano) return

    const conf = readAnti()[m.chat]
    if (!conf) return

    const participantes = groupMetadata?.participants || []
    const ehAdmin = participantes.find(p => (p.id || p.jid) === m.sender)?.admin
    if (ehAdmin) return

    const texto = m.text || ''
    if (!texto) return

    for (const [modo, cfg] of Object.entries(PADROES)) {
        if (!conf[modo]) continue

        const regex = new RegExp(cfg.regex.source, cfg.regex.flags)
        const achados = texto.match(regex)
        if (!achados || !achados.length) continue

        // Ignora o link do próprio grupo
        try {
            const code = await conn.groupInviteCode(m.chat)
            const linkDoGrupo = `chat.whatsapp.com/${code}`
            if (achados.some(a => a.includes(linkDoGrupo))) continue
        } catch { }

        // Ignora o canal oficial do bot
        if (global.canal && achados.some(a => a.includes(global.canal.replace('https://', '')))) continue

        const ehAdminBot = participantes.find(p => (p.id || p.jid) === (conn.user?.jid || conn.user?.id))?.admin
        if (!ehAdminBot) return

        try {
            await conn.sendMessage(m.chat, {
                text: `🚫 *LINK BLOQUEADO!*\n\n👤 @${m.sender.split('@')[0]}\n🔒 *${cfg.nome}*\n\n❌ _${cfg.descricao} no grupo._`,
                mentions: [m.sender]
            })
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch (e) {
            console.error('[ANTILINK] Erro ao remover mensagem:', e.message)
        }
        return
    }
}

const handler = async (m, { args, command, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()
    const cfg = PADROES[cmd]
    if (!cfg) return

    if (!m.isGroup) return m.reply(global.dfail('group'))
    if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

    const arg = (args[0] || '').toLowerCase()
    const all = readAnti()
    const grupo = all[m.chat] || (all[m.chat] = {})

    if (!arg) {
        const ativo = !!grupo[cmd]
        return m.reply(`🔗 *${cfg.nome.toUpperCase()}*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n📝 ${cfg.descricao}\n\n💡 \`!${cmd} on\` / \`!${cmd} off\``)
    }

    if (arg === 'on' || arg === 'ativar' || arg === '1') {
        grupo[cmd] = true
        all[m.chat] = grupo
        writeAnti(all)
        return m.reply(`🔗 *${cfg.nome.toUpperCase()} ATIVADO!*\n\n✅ ${cfg.descricao} neste grupo.`)
    }

    if (arg === 'off' || arg === 'desativar' || arg === '0') {
        grupo[cmd] = false
        all[m.chat] = grupo
        writeAnti(all)
        return m.reply(`🔓 *${cfg.nome.toUpperCase()} DESATIVADO!*`)
    }

    return m.reply(`📝 *Uso:*\n\`!${cmd} on\` — ativar\n\`!${cmd} off\` — desativar`)
}

handler.help = ['antilinkhard', 'antilinkeasy', 'anticatalogo', 'antilar', 'antiligacao']
handler.tags = ['group', 'admin', 'antilink']
handler.command = ['antilinkhard', 'antilinkeasy', 'anticatalogo', 'anticatalg', 'antilar', 'antiligar', 'antiligacao']
handler.group = true

// O carregador do bot usa `module.default || module`, então o hook
// `before` de named export se perderia. Anexamos ao default export.
handler.before = before

export default handler
