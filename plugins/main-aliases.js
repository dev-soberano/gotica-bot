/**

 * @project Gótica Bot - Aliases de Comandos do Minato
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Registra os nomes alternativos de comandos do Minato que apontam
 * para funcionalidades que a Gótica JÁ possui. Isso aumenta a
 * compatibilidade sem duplicar lógica.
 *
 * Cada alias aqui delega para o plugin que já implementa a
 * funcionalidade (via reescrita do texto do comando).
 */

import fs from 'fs'
import path from 'path'

/**
 * Mapa: alias -> comando real.
 * O handler reescreve m.text para o comando real antes do despacho.
 */
const ALIASES = {
    // ── Anti (variantes de nome) ──
    'anti-arqv': 'antidoc',
    'antiligação': 'antiligar',
    'antiligacao': 'antiligar',
    'antipalavrão': 'antipalavra',
    'antipalavrao': 'antipalavra',
    'antiinvisivel': 'antivisu',
    'antipayment': 'antipagamento',
    'anti-delete': 'antidelete',
    'antiddd': 'antiddd-list',
    'anti_ddd': 'antiddd-list',
    'anti-ddd': 'antiddd-list',
    'anti_sp': 'antispam',

    // ── Ranking ──
    'rank': 'ranklevel',
    'rankfalido': 'rankfallido',
    'rankpets': 'rankpets',
    'rankcoins': 'rankcoins',
    'rankpokemon': 'rankpokemon',
    'rankpoke': 'rankpokemon',
    'rankcidade': 'rankcidade',
    'rankingcidade': 'rankcidade',

    // ── Dono ──
    'donobot': 'info-dono',

    // ── Modos ──
    'modtake': 'modotake',

    // ── Transcrição ──
    'ttsearch': 'transcrever',

    // ── Logos ──
    'logomaker': 'logo',

    // ── Coins ──
    'coins': 'meuscoins',

    // ── Aposta da cidade ──
    'apostacidade': 'apostar',

    // ── Aluguel (variantes) ──
    'aguardaraluguel': 'veraluguel',
    'chavepixaluguel': 'chavepix',
    'setpixaluguel': 'editchave',
    'ver_aluguel': 'veraluguel',
    'rg_aluguel': 'lista_aluguel',
    'aluguel': 'painelaluguel',
    'rg_plano': 'planos',
    'planosaluguel': 'planos',
    'planos_aluguel': 'planos',
    'planoaluguel': 'planos',
    'setplanoaluguel': 'planos',
    'editarplanoaluguel': 'planos',
    'delplanoaluguel': 'planos',
    'removerplanoaluguel': 'planos',

    // ── Grupo (variantes) ──
    'fechargp': 'fechar',
    'fechamento': 'fechar',
    'abrirgp': 'abrir',
    'abertura': 'abrir',
    'rmhorario': 'remover_horario',
    'remover_horario': 'remover_horario',

    // ── Comandos extras (variantes) ──
    'rgcmdmod': 'rgcmd',
    'rg_cmdmod': 'rgcmd',
    'rmcmdmod': 'delcmd',
    'rm_cmdmod': 'delcmd',
    'ajudacmd': 'cmdinfo',

    // ── Diversos ──
    'ttsearch2': 'transcrever',
    'figuapi': 'figuanime'
}

/**
 * Plugin `before`: reescreve o texto quando o comando e um alias.
 *
 * O alias NAO registra handler.command de proposito - assim o
 * handler.js continua responsavel pelo despacho e o comando real
 * (com todas as suas restricoes de admin/dono) e quem executa.
 */
export async function before(m, { conn, usedPrefix }) {
    if (!m?.text) return
    const prefixo = usedPrefix || global.prefix || '!'
    const bruto = m.text.trim()

    // So considera textos que começam com prefixo
    if (!bruto.startsWith(prefixo)) return

    const semPrefixo = bruto.slice(prefixo.length).trim()
    const [primeira] = semPrefixo.split(/\s+/)
    if (!primeira) return

    const chave = primeira.toLowerCase()
    const destino = ALIASES[chave]
    if (!destino) return

    // Reescreve mantendo os argumentos
    const resto = semPrefixo.slice(primeira.length)
    m.text = `${prefixo}${destino}${resto}`
}

const handler = async (m, { command }) => {
    // Fallback: se o comando de destino nao existir em nenhum plugin,
    // informa o usuario do alias.
    const cmd = (command || '').toLowerCase()
    const destino = ALIASES[cmd]
    if (!destino) return
    return m.reply(`🔄 *Alias redirecionado!*\n\n\`!${cmd}\` → \`!${destino}\`\n\n💡 Use \`!${destino}\` para ver a ajuda.`)
}

handler.help = ['aliases']
handler.tags = ['main']
// Registra os aliases para que o dispatcher os aceite. O before()
// reescreve m.text ANTES do despacho, entao na pratica o comando
// real (com suas restricoes) e quem executa; este handler so
// entra como fallback quando o destino nao existe.
handler.command = Object.keys(ALIASES)

// O carregador do bot usa `module.default || module`, então o hook
// `before` de named export se perderia. Anexamos ao default export.
handler.before = before

export default handler
