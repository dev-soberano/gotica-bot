/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Rankings & Categorias
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de tags por usuario (estilo Minato): cada usuario pode ter
 * tags como "gay", "puta", "sigma", "otaku"... e os comandos rank*
 * mostram os rankings de cada categoria.
 *
 *  !addtag <tag> [usuario]  - define uma tag
 *  !removetag <tag> [user] - remove uma tag
 *  !listatags / !listtag   - lista as tags
 *  !rankgay, !rankputa...  - rankings por categoria (dinamico)
 */

import fs from 'fs'
import path from 'path'
import { buildRanking, formatNumber, jidNum } from '../lib/helpers-minato.js'

const TAGS_FILE = path.join(process.cwd(), 'src', 'dados', 'tags.json')

/**
 * Categorias disponiveis (tag -> {emoji, titulo}).
 * Substitui os 61 comandos rank* do Minato por um unico plugin
 * dinamico que aceita qualquer tag.
 */
export const CATEGORIAS = {
    gay: { emoji: '🏳️‍🌈', titulo: 'RANK GAY' },
    heterosexual: { emoji: '❤️', titulo: 'RANK HETERO' },
    puta: { emoji: '💋', titulo: 'RANK PUTA' },
    safada: { emoji: '🔥', titulo: 'RANK SAFADA' },
    safado: { emoji: '🔥', titulo: 'RANK SAFADO' },
    gostosa: { emoji: '💋', titulo: 'RANK GOSTOSA' },
    gostoso: { emoji: '💪', titulo: 'RANK GOSTOSO' },
    sigma: { emoji: '💅', titulo: 'RANK SIGMA' },
    otaku: { emoji: '🌸', titulo: 'RANK OTAKU' },
    corno: { emoji: '🐂', titulo: 'RANK CORNO' },
    gado: { emoji: '🐄', titulo: 'RANK GADO' },
    macaco: { emoji: '🐒', titulo: 'RANK MACACO' },
    macaca: { emoji: '🐒', titulo: 'RANK MACACA' },
    nazista: { emoji: '🚫', titulo: 'RANK NAZISTA' },
    louco: { emoji: '🤪', titulo: 'RANK LOUCO' },
    louca: { emoji: '🤪', titulo: 'RANK LOUCA' },
    pau: { emoji: '🍆', titulo: 'RANK PAU' },
    cu: { emoji: '🖕', titulo: 'RANK CU' },
    buceta: { emoji: '🍑', titulo: 'RANK BUCETA' },
    fallido: { emoji: '💸', titulo: 'RANK FALIDO' },
    inativo: { emoji: '💤', titulo: 'RANK INATIVO' },
    beta: { emoji: '🐛', titulo: 'RANK BETA' },
    baiana: { emoji: '🌴', titulo: 'RANK BAIANA' },
    carioca: { emoji: '🏖️', titulo: 'RANK CARIOCA' },
    casal: { emoji: '💑', titulo: 'RANK CASAL' },
    chefes: { emoji: '👑', titulo: 'RANK CHEFES' },
    ativo: { emoji: '⚡', titulo: 'RANK ATIVO' }
}

/** Aliases extras do Minato (alias -> categoria real). */
const RANK_ALIASES = {
    hetero: 'heterosexual',
    bct: 'buceta',
    bucetudas: 'buceta',
    casais: 'casal',
    casalzin: 'casal',
    falidos: 'fallido',
    gados: 'gado',
    cornos: 'corno',
    gostosos: 'gostoso',
    gostosas: 'gostosa',
    nazistas: 'nazista',
    otakus: 'otaku',
    putas: 'puta',
    safadas: 'safada',
    safados: 'safado',
    sigmas: 'sigma',
    inativos: 'inativo',
    betas: 'beta',
    baianas: 'baiana',
    baiano: 'baiana',
    cariocas: 'carioca',
    loucos: 'louco',
    loucas: 'louca',
    macacos: 'macaco',
    macacas: 'macaca',
    paus: 'pau',
    ativos: 'ativo'
}

/** Le as tags. */
function readTags() {
    try {
        if (!fs.existsSync(TAGS_FILE)) return { tags: {} }
        const p = JSON.parse(fs.readFileSync(TAGS_FILE, 'utf-8'))
        return { tags: p.tags || {} }
    } catch {
        return { tags: {} }
    }
}

/** Grava as tags. */
function writeTags(data) {
    try {
        const dir = path.dirname(TAGS_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(TAGS_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

const handler = async (m, { args, command, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // ---- !addtag <tag> [usuario] ----
    if (cmd === 'addtag' || cmd === 'addcategoria' || cmd === 'settag') {
        if (!args[0]) return m.reply('📝 *Uso:*\n!addtag <tag> [numero]\n\n*Exemplo:* `!addtag sigma 554299441624`')
        const tag = args[0].toLowerCase().trim()
        const target = args[1] ? `${jidNum(args[1])}@s.whatsapp.net` : m.sender
        const db = readTags()
        db.tags[tag] = db.tags[tag] || []
        if (!db.tags[tag].some(t => jidNum(t) === jidNum(target))) {
            db.tags[tag].push(target)
        }
        writeTags(db)
        return m.reply(`🏷️ *Tag aplicada!*\n\n👤 ${args[1] || 'você'}\n🔖 Tag: \`${tag}\``)
    }

    // ---- !removetag <tag> [usuario] ----
    if (cmd === 'removetag' || cmd === 'deltag' || cmd === 'rmtag') {
        if (!args[0]) return m.reply('📝 *Uso:*\n!removetag <tag> [numero]')
        const tag = args[0].toLowerCase().trim()
        const target = args[1] ? `${jidNum(args[1])}@s.whatsapp.net` : m.sender
        const db = readTags()
        if (!db.tags[tag]) return m.reply('❌ Tag não encontrada.')
        db.tags[tag] = db.tags[tag].filter(t => jidNum(t) !== jidNum(target))
        writeTags(db)
        return m.reply(`🗑️ *Tag removida!*\n\n👤 ${args[1] || 'você'}\n🔖 Tag: \`${tag}\``)
    }

    // ---- !listatags ----
    if (cmd === 'listatags' || cmd === 'listtag' || cmd === 'tags' || cmd === 'categorias') {
        const db = readTags()
        const keys = Object.keys(db.tags).filter(k => db.tags[k]?.length)

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🏷️ *TAGS CADASTRADAS*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        if (!keys.length) {
            txt += `_Nenhuma tag cadastrada ainda._\n\n`
            txt += `💡 \`!addtag <tag> [numero]\` — aplicar\n`
        } else {
            keys.forEach(k => {
                const meta = CATEGORIAS[k]
                txt += `${meta?.emoji || '🔖'} *${k}* — ${db.tags[k].length} pessoa(s)\n`
            })
        }
        return m.reply(txt)
    }

    // ---- !minhastag / !mytag ----
    if (cmd === 'minhastag' || cmd === 'mytag' || cmd === 'minhasrank') {
        const db = readTags()
        const minhas = Object.entries(db.tags)
            .filter(([, users]) => users.some(u => jidNum(u) === jidNum(m.sender)))
            .map(([k]) => k)

        if (!minhas.length) return m.reply('🏷️ *Você não tem nenhuma tag.*\n\n💡 Use `!addtag <tag>` para receber uma.')
        return m.reply(`🏷️ *SUAS TAGS*\n\n${minhas.map(t => `🔖 \`${t}\``).join('\n')}`)
    }

    // ---- !rank<algo> dinamico ----
    // Qualquer comando que comece com "rank" e interpreted como
    // pedido de ranking de uma categoria.
    if (cmd.startsWith('rank')) {
        let tag = cmd.slice(4).replace(/s$/, '').trim()
        if (!tag) tag = 'sigma'

        // Resolve o alias para a categoria real
        if (RANK_ALIASES[tag]) tag = RANK_ALIASES[tag]

        const db = readTags()
        let lista = db.tags[tag]

        if (!lista) {
            // tenta achar por prefixo mais proximo
            const key = Object.keys(db.tags).find(k => tag.startsWith(k) && db.tags[k]?.length)
            if (key) {
                tag = key
                lista = db.tags[key]
            }
        }

        const meta = CATEGORIAS[tag] || { emoji: '🏆', titulo: `RANK ${tag.toUpperCase()}` }

        if (!lista || !lista.length) {
            return m.reply(`${meta.emoji} *${meta.titulo}*\n\n_📭 Ninguém nesta categoria ainda._\n\n💡 \`!addtag ${tag}\` para entrar!`)
        }

        const itens = lista.map((jid, i) => ({
            nick: `${jid.split('@')[0]}`,
            value: `#${i + 1}`,
            extra: ''
        }))

        return m.reply(buildRanking(itens, meta.titulo, 'Pos', meta.emoji))
    }
}

/**
 * Gera a lista de comandos rank* para registrar no handler.command.
 * Inclui os aliases do Minato (rank + tag, no plural e com sufixos).
 */
const RANK_COMMANDS = []
for (const key of Object.keys(CATEGORIAS)) {
    RANK_COMMANDS.push(`rank${key}`)
    RANK_COMMANDS.push(`rank${key}s`)
    RANK_COMMANDS.push(`ranking${key}`)
}
for (const alias of Object.keys(RANK_ALIASES)) {
    RANK_COMMANDS.push(`rank${alias}`)
    RANK_COMMANDS.push(`rank${alias}s`)
    RANK_COMMANDS.push(`ranking${alias}`)
}

// Remove duplicatas preservando a ordem
const RANK_COMMANDS_UNICOS = [...new Set(RANK_COMMANDS)]

handler.help = ['addtag', 'removetag', 'listatags', 'rank', 'minhastag']
handler.tags = ['rpg', 'rank']
handler.command = ['addtag', 'addcategoria', 'settag', 'removetag', 'deltag', 'rmtag',
    'listatags', 'listtag', 'tags', 'categorias', 'minhastag', 'mytag', 'minhasrank',
    ...RANK_COMMANDS_UNICOS]

export default handler
