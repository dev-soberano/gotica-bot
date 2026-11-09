/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Prefixo por Grupo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !prefixo <char>        - define o prefixo deste grupo
 *  !prefixo <c1> <c2>     - define varios prefixos (multi-prefixo)
 *  !prefixo reset         - volta ao prefixo global
 *  !prefixo               - mostra o prefixo atual
 */

const handler = async (m, { conn, text, usedPrefix, command, isSoberano, isAdmin }) => {
    // Garante que o chat existe no banco
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chat = global.db.data.chats[m.chat]

    const globalPrefix = global.prefix || '!'

    // ---------- !prefixo (sem argumento) - mostra o atual ----------
    if (!text) {
        const atual = chat.prefix || globalPrefix
        const lista = Array.isArray(atual) ? atual : String(atual).split(/\s+/).filter(Boolean)
        return m.reply(
            `🔤 *PREFIXO ATUAL*\n\n` +
            `📌 *Prefixo:* ${lista.map(p => `\`${p}\``).join(' ')}\n` +
            `🌍 *Global:* \`${globalPrefix}\`\n\n` +
            `💡 *Uso:* \`!prefixo <novo>\`\n` +
            `💡 *Resetar:* \`!prefixo reset\``
        )
    }

    // ---------- !prefixo reset ----------
    if (text.toLowerCase() === 'reset' || text.toLowerCase() === 'default' || text.toLowerCase() === 'global') {
        delete chat.prefix
        return m.reply(
            `✅ *Prefixo resetado!*\n\n` +
            `🌍 Agora este grupo usa o prefixo global: \`${globalPrefix}\`\n` +
            `*Exemplo:* \`${globalPrefix}menu\``
        )
    }

    // Valida: cada prefixo precisa ter 1-3 caracteres
    const partes = text.trim().split(/\s+/).filter(Boolean)
    if (!partes.length) {
        return m.reply(`📝 *Uso:*\n!prefixo <novo prefixo>\n\n*Exemplo:* \`!prefixo #\``)
    }

    for (const p of partes) {
        if (p.length > 3) {
            return m.reply('❌ *Prefixo muito longo!*\n\nUse no máximo 3 caracteres.')
        }
    }

    // Salva: string se for 1, array se forem vários
    chat.prefix = partes.length === 1 ? partes[0] : partes

    // Persiste no banco (lowdb)
    try {
        if (typeof global.db?.write === 'function') await global.db.write()
    } catch (e) {
        console.error('[PREFIXO] Erro ao salvar no banco:', e.message)
    }

    const lista = partes.map(p => `\`${p}\``).join(' ')

    return m.reply(
        `✅ *Prefixo alterado com sucesso!*\n\n` +
        `📌 *Agora use:* ${lista}\n` +
        `*Exemplo:* ${partes.map(p => `${p}menu`).join('  ou  ')}\n\n` +
        `🌍 *Global (outros grupos):* \`${globalPrefix}\``
    )
}

handler.help = ['prefixo <caractere>']
handler.tags = ['group', 'admin']
handler.command = ['prefixo', 'prefix', 'setprefix']
handler.group = true
handler.admin = true

export default handler
