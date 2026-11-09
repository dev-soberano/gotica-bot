/**

 *
 * @project Gótica Bot - Permissões por Grupo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de permissões scoped por grupo, no estilo Minato:
 *  !donogp          - define você como dono deste grupo
 *  !rmdonogp        - remove sua permissão de dono do grupo
 *  !addperm <num> [perm]  - dá permissão a alguém no grupo
 *  !rmperm <num> [perm]   - revoga permissão
 *  !listperm        - lista permissões do grupo
 *  !donosgp         - lista grupos onde você é dono
 */

import { addPermissao, removePermissao, listPermissoes, marcarGrupoDono, listGruposDono, hasPermissao } from '../lib/owners.js'

const handler = async (m, { conn, args, command, isSoberano, isAdmin, groupMetadata }) => {
    const cmd = (command || '').toLowerCase()
    const groupId = m.chat

    if (!m.isGroup) return m.reply(global.dfail('group'))

    // !donogp — me torna dono deste grupo
    if (cmd === 'donogp' || cmd === 'adddonogp') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

        const res = marcarGrupoDono(groupId, m.sender)
        if (!res.ok) return m.reply('❌ Falha ao marcar o grupo.')

        return m.reply(`👑 *VOCÊ AGORA É DONO DESTE GRUPO!*\n\n📱 Grupo: ${groupMetadata?.subject || 'Grupo'}\n\n✨ Agora você pode usar os comandos restritos daqui.`)
    }

    // !rmdonogp — remove minha permissão de dono do grupo
    if (cmd === 'rmdonogp' || cmd === 'rmdonogp') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

        const res = removePermissao(groupId, m.sender, 'dono')
        if (!res.ok) return m.reply('❌ Você não tem permissão de dono neste grupo.')
        return m.reply('✅ *Permissão de dono removida deste grupo!*')
    }

    // !addperm <numero> [tipo]
    if (cmd === 'addperm' || cmd === 'add_permissao') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!addperm <numero> [tipo]\n\n*Tipos:* \`dono\` (padrão), \`vip\`, \`mod\`\n\n*Exemplo:* \`!addperm 554299441624 dono\``)

        const perm = (args[1] || 'dono').toLowerCase()
        const res = addPermissao(groupId, args[0], perm)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)

        return m.reply(`✅ *Permissão concedida!*\n\n👤 ${args[0]}\n🔑 Tipo: \`${perm}\`\n📍 Neste grupo`)
    }

    // !rmperm <numero> [tipo]
    if (cmd === 'rmperm' || cmd === 'rm_permissao' || cmd === 'del_permissao') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!rmperm <numero> [tipo]\n\n*Exemplo:* \`!rmperm 554299441624 dono\``)

        const perm = (args[1] || 'dono').toLowerCase()
        const res = removePermissao(groupId, args[0], perm)
        if (!res.ok) return m.reply('❌ Permissão não encontrada.')

        return m.reply(`✅ *Permissão revogada!*\n\n👤 ${args[0]}\n🔑 Tipo: \`${perm}\``)
    }

    // !listperm
    if (cmd === 'listperm' || cmd === 'listapermissao' || cmd === 'listaperm') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const perms = listPermissoes(groupId)

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🔐 *PERMISSÕES DO GRUPO*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        const keys = Object.keys(perms).filter(k => Array.isArray(perms[k]) && perms[k].length)
        if (!keys.length) {
            txt += `_Nenhuma permissão extra neste grupo._\n`
        } else {
            keys.forEach(k => {
                txt += `🔑 *${k}*\n`
                perms[k].forEach(u => txt += `   • ${u}\n`)
                txt += `\n`
            })
        }

        txt += `━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 \`!addperm <num> [tipo]\` — conceder\n`
        txt += `💡 \`!rmperm <num> [tipo]\` — revogar`
        return m.reply(txt)
    }

    // !donosgp — grupos onde eu sou dono
    if (cmd === 'donosgp' || cmd === 'listagpdonos') {
        const grupos = listGruposDono(m.sender)

        let txt = `👑 *GRUPOS QUE VOCÊ ADMINISTRA*\n\n`
        if (!grupos.length) {
            txt += `_Você ainda não é dono de nenhum grupo._\n\n💡 Use \`!donogp\` em um grupo para assume-lo.`
        } else {
            grupos.forEach((g, i) => txt += `${i + 1}. \`${g}\`\n`)
        }
        return m.reply(txt)
    }
}

handler.help = ['donogp', 'rmdonogp', 'addperm', 'rmperm', 'listperm', 'donosgp']
handler.tags = ['owner', 'group']
handler.command = ['donogp', 'adddonogp', 'rmdonogp', 'addperm', 'add_permissao', 'rmperm', 'rm_permissao',
    'del_permissao', 'listperm', 'listapermissao', 'listaperm', 'donosgp', 'listagpdonos']
handler.group = true

export default handler
