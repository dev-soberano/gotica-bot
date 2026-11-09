/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Sistema de Modos
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Os "modos" do Minato controlam o comportamento do bot por grupo.
 * Cada modo é uma chave booleana em src/dados/modos.json e é
 * lido por outros plugins via `isModoAtivo(grupo, 'nome')`.
 *
 *  !modolevel on|off      - XP/level no grupo
 *  !modocoins on|off      - economia/coins no grupo
 *  !modocontador on|off   - contador de mensagens
 *  !modobn on|off         - comandos +18 liberados
 *  !modobrincadeira on|off- brincadeiras liberadas
 *  !modoia on|off         - comandos de IA liberados
 *  !modobotoes on|off     - botões interativos
 *  !modoimg on|off        - imagens/figurinhas
 *  !modotake on|off       - marca d'água
 *  !modoplaylist on|off   - playlists
 *  !modopix on|off        - PIX
 *  !modoimagem on|off     (alias)
 *  !listamodos            - lista os modos e seu estado
 */

import fs from 'fs'
import path from 'path'

const MODES_FILE = path.join(process.cwd(), 'src', 'dados', 'modos.json')

/** Definição dos modos e seus rótulos. */
export const MODOS = {
    level: { nome: 'Level/XP', emoji: '🏅' },
    coins: { nome: 'Economia/Coins', emoji: '💰' },
    contador: { nome: 'Contador de Mensagens', emoji: '🔢' },
    bn: { nome: 'Comandos +18', emoji: '🔞' },
    brincadeira: { nome: 'Brincadeiras', emoji: '🎲' },
    ia: { nome: 'Inteligência Artificial', emoji: '🤖' },
    botoes: { nome: 'Botões Interativos', emoji: '🔘' },
    img: { nome: 'Imagens/Figurinhas', emoji: '🖼️' },
    take: { nome: 'Marca d\'água (Take)', emoji: '🔖' },
    playlist: { nome: 'Playlists', emoji: '📻' },
    pix: { nome: 'PIX', emoji: '🔑' },
    imagem: { nome: 'Imagens', emoji: '📷' },
    admin: { nome: 'Somente Admins', emoji: '🛡️' }
}

/** Mapa comando -> chave do modo. */
const CMD_MAP = {
    modolevel: 'level',
    'modolevel': 'level',
    modocoins: 'coins',
    modocontador: 'contador',
    modobn: 'bn',
    modobrincadeira: 'brincadeira',
    modobrincadeiras: 'brincadeira',
    modoia: 'ia',
    modobotoes: 'botoes',
    modoimg: 'img',
    modoimagem: 'imagem',
    modotake: 'take',
    modoplaylist: 'playlist',
    modopix: 'pix'
}

/** Lê os modos. */
export function readModos() {
    try {
        if (!fs.existsSync(MODES_FILE)) return {}
        const p = JSON.parse(fs.readFileSync(MODES_FILE, 'utf-8'))
        return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {}
    } catch {
        return {}
    }
}

/** Grava os modos. */
export function writeModos(data) {
    try {
        const dir = path.dirname(MODES_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(MODES_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/**
 * Verifica se um modo está ativo num grupo.
 * Quando o modo não foi configurado, assume o valor padrão (true).
 */
export function isModoAtivo(groupId, modo) {
    const db = readModos()
    const g = db[groupId]
    if (!g || typeof g[modo] !== 'boolean') return true
    return g[modo]
}

const handler = async (m, { args, command, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !listamodos ----------
    if (cmd === 'listamodos' || cmd === 'listmodos' || cmd === 'modos' || cmd === 'painelmodos') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const db = readModos()
        const g = db[m.chat] || {}

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🎛️ *MODOS DO GRUPO*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        Object.entries(MODOS).forEach(([key, meta]) => {
            const ativo = typeof g[key] === 'boolean' ? g[key] : true
            txt += `${ativo ? '🟢' : '🔴'} *${meta.emoji} ${meta.nome}*\n`
        })

        txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 \`!modo<nome> on|off\` — alterar\n`
        txt += `💡 Exemplo: \`!modobn on\``
        return m.reply(txt)
    }

    const key = CMD_MAP[cmd]
    if (!key) return

    if (!m.isGroup) return m.reply(global.dfail('group'))
    if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

    const db = readModos()
    const g = db[m.chat] || (db[m.chat] = {})
    const meta = MODOS[key]

    const arg = (args[0] || '').toLowerCase()

    if (!arg) {
        const ativo = typeof g[key] === 'boolean' ? g[key] : true
        return m.reply(`🎛️ *${meta.emoji} ${meta.nome}*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n\n💡 \`!${cmd} on\` / \`!${cmd} off\``)
    }

    if (arg === 'on' || arg === 'ativar' || arg === '1') {
        g[key] = true
        db[m.chat] = g
        writeModos(db)
        return m.reply(`✅ *${meta.emoji} ${meta.nome} ATIVADO!*\n\nO modo está valendo neste grupo.`)
    }

    if (arg === 'off' || arg === 'desativar' || arg === '0') {
        g[key] = false
        db[m.chat] = g
        writeModos(db)
        return m.reply(`✅ *${meta.emoji} ${meta.nome} DESATIVADO!*\n\nO modo foi desligado neste grupo.`)
    }

    return m.reply(`📝 *Uso:*\n\`!${cmd} on\` — ativar\n\`!${cmd} off\` — desativar`)
}

handler.help = ['modolevel', 'modocoins', 'modobn', 'modoia', 'listamodos']
handler.tags = ['group', 'admin']
handler.command = ['listamodos', 'listmodos', 'modos', 'painelmodos',
    'modolevel', 'modocoins', 'modocontador', 'modobn', 'modobrincadeira', 'modobrincadeiras',
    'modoia', 'modobotoes', 'modoimg', 'modoimagem', 'modotake', 'modoplaylist', 'modopix']
handler.group = true

export default handler
