/**
 * @project Gótica Bot - Sistema de Donos (dono1..dono6)
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos de gestão dos donos globais do bot, no estilo Minato:
 *  !dono          - mostra todos os donos
 *  !dono1..!dono6 - mostra/troca o dono de um slot
 *  !setdono <n> <slot> - define um dono
 *  !rmdono <slot> - remove um dono
 */

import { getDonoSlots, setDono, removeDono, getAllOwners, jidNum } from '../lib/owners.js'

/** Formata um número bonito (+55 42 9944-1624). */
function fmtNum(jid) {
    const num = jidNum(jid)
    if (!num) return '—'
    const local = num.length > 11 ? num.slice(num.length - 11) : num
    const ddd = local.slice(0, 2)
    const rest = local.slice(2)
    return `+${local.length > 11 ? num.slice(0, num.length - 11) : '55'} ${ddd} ${rest.slice(0, rest.length - 4)}-${rest.slice(4)}`
}

const handler = async (m, { conn, args, command, text, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // !dono1..!dono6 — mostra ou define o dono do slot
    const slotMatch = /^dono([1-6])$/.exec(cmd)
    if (slotMatch) {
        const slot = Number(slotMatch[1])

        if (!args[0]) {
            const slots = getDonoSlots()
            const s = slots.find(x => x.slot === slot)
            if (!s?.definido) {
                return m.reply(`👑 *Dono${slot}*\n\n❌ Ainda não definido.\n\n💡 Use: *!setdono <numero> ${slot}*`)
            }
            return m.reply(`👑 *Dono${slot}*\n\n📱 *Número:* ${fmtNum(s.jid)}\n🔗 *JID:* \`${s.jid}\`\n✅ *Ativo*`)
        }

        // Apenas o soberano pode trocar donos
        if (!isSoberano) return m.reply(global.dfail('owner'))

        const res = setDono(slot, args[0])
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`✅ *Dono${slot} definido!*\n\n📱 ${fmtNum(res.jid)}\n🔗 \`${res.jid}\``)
    }

    // !setdono <numero> <slot>
    if (cmd === 'setdono' || cmd === 'adddono' || cmd === 'adddono1') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const numero = args[0]
        const slot = args[1]
        if (!numero || !slot) {
            return m.reply(`📝 *Uso:*\n!setdono <numero> <slot 1-6>\n\n*Exemplo:* \`!setdono 554299441624 1\``)
        }
        const res = setDono(slot, numero)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`✅ *Dono${res.slot} definido!*\n\n📱 ${fmtNum(res.jid)}\n🔗 \`${res.jid}\`\n\n⚠️ Reinicie o bot para aplicar em todos os sessões.`)
    }

    // !rmdono <slot>
    if (cmd === 'rmdono' || cmd === 'deldono' || cmd === 'removedono') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const slot = args[0]
        if (!slot) return m.reply(`📝 *Uso:*\n!rmdono <slot 1-6>\n\n*Exemplo:* \`!rmdono 3\``)
        const res = removeDono(slot)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`🗑️ *Dono${slot} removido!*\n\nJID removido: \`${res.removed || 'vazio'}\``)
    }

    // !dono — lista todos
    if (cmd === 'dono' || cmd === 'donos' || cmd === 'listadono' || cmd === 'listdonos' || cmd === 'infodono') {
        const slots = getDonoSlots()
        const all = getAllOwners()

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  👑 *DONOS DA GÓTICA BOT*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        slots.forEach(s => {
            txt += s.definido
                ? `✅ *dono${s.slot}* — ${fmtNum(s.jid)}\n   \`${s.jid}\`\n`
                : `➖ *dono${s.slot}* — _vago_\n`
        })

        txt += `\n📊 *Total de donos:* ${all.length}\n`
        txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 *Comandos:*\n`
        txt += `• \`!setdono <num> <slot>\` — definir\n`
        txt += `• \`!rmdono <slot>\` — remover\n`
        txt += `• \`!dono1\` a \`!dono6\` — ver slot\n\n`
        txt += `✨ *by Dev Soberano*`

        return m.reply(txt)
    }
}

handler.help = ['dono', 'donos', 'dono1', 'dono2', 'dono3', 'dono4', 'dono5', 'dono6', 'setdono', 'rmdono']
handler.tags = ['owner']
handler.command = ['dono1', 'dono2', 'dono3', 'dono4', 'dono5', 'dono6',
    'setdono', 'adddono', 'adddono1', 'rmdono', 'deldono', 'removedono']
handler.owner = true

export default handler
