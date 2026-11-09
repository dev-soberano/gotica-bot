/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Sistema de Level / XP
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !nivel / !leveling / !xp / !me      - seu level
 *  !ranklevel / !rankxp                - ranking do grupo
 *  !rankglobal / !topglobal            - ranking global
 *  !addxp <num> <valor>                - (dono) adiciona XP
 *  !tirarxp <num> <valor>              - (dono) remove XP
 *  !blocklevel / !unblocklevel         - (dono) bloqueia level no grupo
 */

import {
    getUserLevel, addXP, usuariosLevel, usuariosLevelGlobal, blockLevel, unblockLevel,
    xpParaProximoNivel, buildRanking, formatNumber
} from '../lib/helpers-minato.js'

/** Patentes por XP. */
const PATENTES = [
    { min: 0, nome: 'Novato' },
    { min: 5, nome: 'Iniciante' },
    { min: 10, nome: 'Aprendiz' },
    { min: 20, nome: 'Aventureiro' },
    { min: 30, nome: 'Veterano' },
    { min: 45, nome: 'Elite' },
    { min: 60, nome: 'Mestre' },
    { min: 80, nome: 'Lenda' },
    { min: 100, nome: 'Soberano' },
    { min: 130, nome: 'Imortal' },
    { min: 170, nome: 'Divino' }
]

/** Retorna a patente correspondente a um XP. */
function getPatenteByXp(xp) {
    let atual = PATENTES[0]
    for (const p of PATENTES) if (xp >= p.min) atual = p
    return atual
}

/** Normaliza o alvo para JID. */
function normalizeTarget(arg) {
    const raw = String(arg || '').replace(/[^0-9]/g, '')
    return raw ? `${raw}@s.whatsapp.net` : ''
}

const handler = async (m, { args, command, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    // ================= COMANDOS DE DONO =================
    if (cmd === 'addxp') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0] || !args[1]) {
            return m.reply('📝 *Uso:*\n!addxp <numero> <valor>\n\n*Exemplo:* `!addxp 554299441624 500`')
        }
        const valor = parseInt(args[1])
        if (isNaN(valor)) return m.reply('❌ O valor precisa ser um número.')

        const target = normalizeTarget(args[0])
        const res = addXP(m.chat, target, valor, args[0])
        return m.reply(`✨ *XP adicionado!*\n\n👤 ${args[0]}\n➕ *+${formatNumber(valor)} XP*\n📊 Total: *${formatNumber(res.xp)} XP*\n🏅 Nível: *${res.level}*\n👑 Patente: *${res.patente.nome}*`)
    }

    if (cmd === 'tirarxp' || cmd === 'removerxp') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!args[0] || !args[1]) {
            return m.reply('📝 *Uso:*\n!tirarxp <numero> <valor>\n\n*Exemplo:* `!tirarxp 554299441624 500`')
        }
        const valor = parseInt(args[1])
        if (isNaN(valor)) return m.reply('❌ O valor precisa ser um número.')

        const target = normalizeTarget(args[0])
        const res = addXP(m.chat, target, -valor, args[0])
        return m.reply(`➖ *XP removido!*\n\n👤 ${args[0]}\n➖ *-${formatNumber(valor)} XP*\n📊 Total: *${formatNumber(res.xp)} XP*\n🏅 Nível: *${res.level}*`)
    }

    if (cmd === 'blocklevel') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        blockLevel(m.chat)
        return m.reply('🚫 *Level bloqueado neste grupo!*')
    }

    if (cmd === 'unblocklevel') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        unblockLevel(m.chat)
        return m.reply('✅ *Level desbloqueado neste grupo!*')
    }

    // ================= RANKING GLOBAL =================
    if (cmd === 'rankglobal' || cmd === 'topglobal') {
        const ranking = usuariosLevelGlobal().sort((a, b) => b.xp - a.xp).slice(0, 20)
        const itens = ranking.map(u => ({
            nick: u.nick,
            value: formatNumber(u.xp),
            extra: `Nível ${u.level}`
        }))
        return m.reply(buildRanking(itens, 'ʀᴀɴᴋ ɢʟᴏʙᴀʟ', 'XP', '🌍'))
    }

    // ================= RANKING DO GRUPO =================
    if (cmd === 'ranklevel' || cmd === 'rankxp') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const ranking = usuariosLevel(m.chat).sort((a, b) => b.xp - a.xp).slice(0, 20)
        if (!ranking.length) {
            return m.reply('📊 *Ranking de Level*\n\n_📭 Ninguém ganhou XP ainda neste grupo._\n\n💡 Envie mensagens para ganhar XP!')
        }
        const itens = ranking.map(u => ({
            nick: u.nick,
            value: formatNumber(u.xp),
            extra: `Nível ${u.level}`
        }))
        return m.reply(buildRanking(itens, 'ʀᴀɴᴋ ᴅᴇ ʟᴇᴠᴇʟ', 'XP'))
    }

    // ================= MEU LEVEL =================
    if (cmd === 'nivel' || cmd === 'leveling' || cmd === 'xp' || cmd === 'me') {
        const target = args[0] ? normalizeTarget(args[0]) : m.sender
        const u = getUserLevel(m.chat, target)
        const patente = getPatenteByXp(u.xp)
        const proximo = xpParaProximoNivel(u.level)
        const faltam = Math.max(0, proximo - u.xp)
        const progresso = proximo > 0 ? Math.min(100, Math.floor((u.xp / proximo) * 100)) : 0

        const barra = '█'.repeat(Math.floor(progresso / 10)).padEnd(10, '░')

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🏅 *SEU LEVEL*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `👤 *Usuário:* ${m.pushName || (args[0] || 'você')}\n`
        txt += `🏅 *Nível:* ${u.level}\n`
        txt += `👑 *Patente:* ${patente.nome}\n`
        txt += `⭐ *XP:* ${formatNumber(u.xp)}\n\n`
        txt += `📊 *Progresso:* \`${barra}\` ${progresso}%\n`
        txt += `🎯 *Faltam:* ${formatNumber(faltam)} XP para o nível ${u.level + 1}\n\n`
        txt += `✨ *by Dev Soberano*`
        return m.reply(txt)
    }
}

handler.help = ['nivel', 'leveling', 'ranklevel', 'rankxp', 'addxp', 'tirarxp']
handler.tags = ['rpg', 'level']
// 'level' e 'patente' ja existem em plugins/level.js - mantidos aqui apenas
// os aliases que ainda nao existiam na base.
handler.command = ['nivel', 'leveling', 'me', 'xp', 'ranklevel', 'rankxp',
    'topglobal', 'addxp', 'tirarxp', 'removerxp', 'blocklevel', 'unblocklevel']

export default handler
