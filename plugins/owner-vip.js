/**
 * @project Gótica Bot - Sistema VIP
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !addvip <numero>    - adiciona VIP
 *  !delvip <numero>    - remove VIP
 *  !viplist            - lista VIPs
 *  !checkvip           - verifica se você é VIP
 */

import { addVip, removeVip, listVips, isVip, jidNum } from '../lib/owners.js'

const handler = async (m, { args, command, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // !addvip <numero>
    if (cmd === 'addvip') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!addvip <numero>\n\n*Exemplo:* \`!addvip 554299441624\``)

        const res = addVip(args[0])
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`💎 *VIP adicionado!*\n\n📱 ${args[0]}\n🔗 \`${res.jid}\`\n\n✨ Agora o usuário tem acesso aos recursos premium.`)
    }

    // !delvip <numero>
    if (cmd === 'delvip' || cmd === 'removevip' || cmd === 'tirarvip') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!delvip <numero>\n\n*Exemplo:* \`!delvip 554299441624\``)

        const res = removeVip(args[0])
        if (!res.ok) return m.reply('❌ Esse usuário não é VIP.')
        return m.reply(`🗑️ *VIP removido!*\n\n📱 ${args[0]}`)
    }

    // !viplist
    if (cmd === 'viplist' || cmd === 'listavip' || cmd === 'listvip' || cmd === 'vips') {
        const vips = listVips()

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  💎 *LISTA DE VIPs*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `👥 *Total:* ${vips.length}\n\n`

        if (vips.length) {
            vips.forEach((v, i) => txt += `${i + 1}. ${v}\n`)
        } else {
            txt += `_Nenhum VIP cadastrado._\n`
        }

        txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `💡 \`!addvip <num>\` — adicionar\n`
        txt += `💡 \`!delvip <num>\` — remover`
        return m.reply(txt)
    }

    // !checkvip
    if (cmd === 'checkvip' || cmd === 'verificavip' || cmd === 'consultar_vip') {
        const target = args[0] || m.sender
        const num = jidNum(target)
        const vip = isVip(target)

        if (!args[0]) {
            return m.reply(vip
                ? `💎 *VOCÊ É VIP!*\n\n✨ Você tem acesso a todos os recursos premium da Gótica Bot.`
                : `❌ *VOCÊ NÃO É VIP*\n\n💡 Entre em contato para assinar o VIP.`)
        }

        return m.reply(vip
            ? `💎 *${num} É VIP!*`
            : `❌ *${num} NÃO É VIP*`)
    }
}

handler.help = ['addvip', 'delvip', 'viplist', 'checkvip']
handler.tags = ['owner']
handler.command = ['addvip', 'delvip', 'removevip', 'tirarvip', 'viplist', 'listavip', 'listvip', 'vips',
    'checkvip', 'verificavip', 'consultar_vip']
handler.owner = true

export default handler
