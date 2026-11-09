/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Info do Bot & Efeitos de Imagem
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !infobot   - informações gerais do bot (design Gótica)
 *  !efeitoimg - efeitos de imagem
 *  !botinfo   - alias de infobot
 */

import os from 'os'
import moment from 'moment-timezone'
import { cabecalhoMenu, caixaSimples } from '../lib/molduras.js'

const handler = async (m, { conn, args, command, text }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ !infobot / !botinfo ══════════════
    if (cmd === 'infobot' || cmd === 'botinfo' || cmd === 'info-bot') {
        const uptime = process.uptime()
        const d = Math.floor(uptime / 86400)
        const h = Math.floor(uptime / 3600) % 24
        const mi = Math.floor(uptime / 60) % 60
        const s = Math.floor(uptime) % 60

        const uptimeStr = [
            d ? `${d}d` : '',
            h ? `${h}h` : '',
            mi ? `${mi}m` : '',
            s ? `${s}s` : ''
        ].filter(Boolean).join(' ') || '0s'

        const memoria = process.memoryUsage()
        const usedMem = (memoria.heapUsed / 1024 / 1024).toFixed(2)
        const totalMem = (memoria.rss / 1024 / 1024).toFixed(2)

        let baileysVersion = '7.0.0'
        try {
            const { readFileSync } = await import('fs')
            const path = await import('path')
            const pkgPath = path.join(process.cwd(), 'node_modules', '@whiskeysockets', 'baileys', 'package.json')
            baileysVersion = JSON.parse(readFileSync(pkgPath, 'utf-8')).version
        } catch { }

        const botName = global.packname || 'Gótica Bot'
        const owner = global.author || 'Dev Soberano'
        const senderNum = (m.sender || '').replace(/[^0-9]/g, '')

        const txt = cabecalhoMenu({
            nome: botName,
            dono: owner,
            numero: senderNum,
            prefixo: global.prefix || '!',
            vip: 'SIM',
            cargo: 'usuário',
            velocidade: '0.001s',
            uptime: uptimeStr,
            total: 0,
            emoji: '🤖'
        })

        // Bloco de sistema, inserido antes do rodapé
        const bloco = [
            `${TEMA_LINHA}💾 *Memória:* ${usedMem} MB / ${totalMem} MB`,
            `${TEMA_LINHA}🖥️ *Plataforma:* ${os.platform()} ${os.arch()}`,
            `${TEMA_LINHA}📦 *Node:* ${process.version}`,
            `${TEMA_LINHA}📅 *Data:* ${moment.tz('America/Sao_Paulo').format('DD/MM/YYYY')}`
        ].join('\n')

        const linhas = txt.split('\n')
        const idxRodape = linhas.findIndex(l => l.startsWith('┎'))
        const saida = [
            ...linhas.slice(0, idxRodape),
            bloco,
            ...linhas.slice(idxRodape)
        ].join('\n')

        return m.reply(saida)
    }

    // ══════════════ !efeitoimg ══════════════
    if (cmd === 'efeitoimg' || cmd === 'efeitosimg') {
        const efeitos = [
            ['!logoneon', 'Estilo neon'],
            ['!logomatrix', 'Estilo matrix'],
            ['!logoglitch', 'Estilo glitch'],
            ['!logosad', 'Estilo triste'],
            ['!logodragonball', 'Tema Dragon Ball'],
            ['!logopubg', 'Tema PUBG'],
            ['!logolol', 'Tema League of Legends'],
            ['!logohorror', 'Estilo de terror'],
            ['!logomaker', 'Criador de logos'],
            ['!logochristmas', 'Tema natalino'],
            ['!logogaming', 'Tema gamer'],
            ['!logoportadaplayer', 'Porta de jogador']
        ]

        const linhas = efeitos.map(([cmdName, nome]) => `\`${cmdName}\` — ${nome}`)

        return m.reply(caixaSimples('Efeitos de Imagem', linhas, '🖼️'))
    }
}

/** Barra usada nas linhas de dado. */
const TEMA_LINHA = '┇┆'

handler.help = ['infobot', 'botinfo', 'efeitoimg']
handler.tags = ['main', 'info']
handler.command = ['infobot', 'botinfo', 'info-bot', 'efeitoimg', 'efeitosimg']

export default handler
