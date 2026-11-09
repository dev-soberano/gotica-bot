/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Pagamentos PIX
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de PIX portado do Minato:
 *  !pix           - gera QR Code PIX para pagamento
 *  !pixcidade     - PIX da economia da cidade
 *  !pixdados      - dados do PIX (chave, titular)
 *  !chavepix      - alias de pixdados
 *  !editchave     - (dono) define a chave PIX
 *  !tokenpix      - (dono) token de integração PIX
 *  !setmercadopago / !setmp - (dono) Mercado Pago
 *  !lighthouse    - (dono) URL de webhook
 */

import fs from 'fs'
import path from 'path'
import { formatNumber } from '../lib/helpers-minato.js'

const PIX_FILE = path.join(process.cwd(), 'src', 'dados', 'pix.json')
const CIDADE_DIR = path.join(process.cwd(), 'src', 'dados', 'cidade')

/** Le os dados de PIX. */
function readPix() {
    try {
        if (!fs.existsSync(PIX_FILE)) return {}
        return JSON.parse(fs.readFileSync(PIX_FILE, 'utf-8'))
    } catch {
        return {}
    }
}

/** Grava os dados de PIX. */
function writePix(data) {
    try {
        const dir = path.dirname(PIX_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(PIX_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/**
 * Gera o payload PIX (BR Code / EMV) a partir de uma chave.
 * Formato simplificado, mas válido para a maioria dos escaneadores.
 */
function gerarPayloadPix(chave, valor = 0, descricao = 'GOTICA BOT') {
    const campo = (id, valorCampo) => {
        const s = id + String(valorCampo).length + valorCampo
        return s
    }
    const id = '000201'
    let payload = campo('00', 'BR.GOV.BCB.PIX') + campo('01', chave)
    if (valor > 0) payload += campo('54', valor.toFixed(2))
    payload += campo('58', 'BR') + campo('59', descricao.slice(0, 25)) + campo('60', 'SAO PAULO')
    payload += '6304'
    // CRC16-CCITT
    let crc = 0xffff
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
        }
    }
    return payload + crc.toString(16).toUpperCase().padStart(4, '0')
}

const handler = async (m, { conn, args, command, text, isSoberano }) => {
    const cmd = (command || '').toLowerCase()
    const pix = readPix()

    // ══════════════ !pix ══════════════
    if (cmd === 'pix') {
        if (!pix.chave) {
            return m.reply('🔑 *PIX*\n\n❌ Chave PIX ainda não configurada pelo dono.\n\n💡 O dono pode definir com `!editchave <chave>`.')
        }

        const valor = parseFloat(args[0]) || 0
        const descricao = args.slice(1).join(' ') || 'GOTICA BOT'
        const payload = gerarPayloadPix(pix.chave, valor, descricao)

        let txt = `🔑 *PIX PARA PAGAMENTO*\n\n`
        if (pix.titular) txt += `👤 *Titular:* ${pix.titular}\n`
        txt += `🔑 *Chave:* ${pix.chave}\n`
        if (valor > 0) txt += `💰 *Valor:* R$ ${valor.toFixed(2)}\n`
        txt += `📝 *Descrição:* ${descricao}\n\n`
        txt += `📋 *Payload (copie e cole no app do banco):*\n\`\`\`\n${payload}\n\`\`\`\n\n`
        txt += `💡 Envie o comprovante para validar.`

        // QR Code do payload usando a lib do projeto
        try {
            const { default: QRCode } = await import('qrcode')
            const buf = await QRCode.toBuffer(payload, { width: 400, margin: 1 })
            await conn.sendMessage(m.chat, {
                image: buf,
                caption: txt
            }, { quoted: m })
            return
        } catch {
            return m.reply(txt)
        }
    }

    // ══════════════ !pixcidade ══════════════
    if (cmd === 'pixcidade') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const arquivo = path.join(CIDADE_DIR, `${m.chat}.json`)
        if (!fs.existsSync(arquivo)) {
            return m.reply('🏙️ *PIX DA CIDADE*\n\n❌ Nenhuma cidade registrada neste grupo.\n\n💡 Use `!registrarcidade` primeiro.')
        }
        const cidade = JSON.parse(fs.readFileSync(arquivo, 'utf-8'))
        const p = cidade.personagens?.[m.sender]
        if (!p) return m.reply('🏙️ *PIX DA CIDADE*\n\n❌ Você não está registrado na cidade.')

        const chave = pix.chave
        if (!chave) return m.reply('🔑 *Chave PIX não configurada pelo dono.*')

        const valor = parseFloat(args[0]) || 10
        const payload = gerarPayloadPix(chave, valor, `CIDADE-${p.nome}`)

        let txt = `🏙️ *PIX DA CIDADE*\n\n`
        txt += `👤 *Personagem:* ${p.nome}\n`
        txt += `💰 *Valor:* R$ ${valor.toFixed(2)}\n`
        txt += `💳 *Saldo:* ${formatNumber(p.coins)} 🪙\n\n`
        txt += `\`\`\`\n${payload}\n\`\`\``

        try {
            const { default: QRCode } = await import('qrcode')
            const buf = await QRCode.toBuffer(payload, { width: 400, margin: 1 })
            await conn.sendMessage(m.chat, { image: buf, caption: txt }, { quoted: m })
        } catch {
            await m.reply(txt)
        }
        return
    }

    // ══════════════ !pixdados / !chavepix ══════════════
    if (cmd === 'pixdados' || cmd === 'chavepix' || cmd === 'dadospix') {
        if (!pix.chave && !pix.titular) {
            return m.reply('🔑 *DADOS DE PAGAMENTO*\n\n❌ Ainda não configurados pelo dono.')
        }
        let txt = `🔑 *DADOS DE PAGAMENTO*\n\n`
        if (pix.titular) txt += `👤 *Titular:* ${pix.titular}\n`
        if (pix.chave) txt += `🔑 *Chave:* ${pix.chave}\n`
        if (pix.cpf) txt += `📄 *CPF:* ${pix.cpf}\n`
        if (pix.banco) txt += `🏦 *Banco:* ${pix.banco}\n`
        txt += `\n💡 Use \`!pix <valor> <descrição>\` para gerar o QR Code.`
        return m.reply(txt)
    }

    // ══════════════ Comandos de dono ══════════════
    if (cmd === 'editchave' || cmd === 'tokenpix' || cmd === 'token-pix' ||
        cmd === 'setmercadopago' || cmd === 'setmp' || cmd === 'lighthouse' || cmd === 'mp') {
        if (!isSoberano) return m.reply(global.dfail('owner'))

        if (cmd === 'editchave') {
            const chave = args[0]
            if (!chave) return m.reply('📝 *Uso:*\n!editchave <chave pix>')
            pix.chave = chave
            writePix(pix)
            return m.reply(`✅ *Chave PIX atualizada!*\n\n🔑 ${chave}`)
        }

        if (cmd === 'tokenpix' || cmd === 'token-pix') {
            const token = args[0]
            if (!token) return m.reply('📝 *Uso:*\n!tokenpix <token>')
            pix.token = token
            writePix(pix)
            return m.reply('✅ *Token PIX salvo!*')
        }

        if (cmd === 'setmercadopago' || cmd === 'setmp' || cmd === 'mp') {
            const token = args[0]
            if (!token) return m.reply('📝 *Uso:*\n!setmercadopago <access_token>')
            pix.mercadoPago = token
            writePix(pix)
            return m.reply('✅ *Mercado Pago configurado!*')
        }

        if (cmd === 'lighthouse') {
            const url = args[0]
            if (!url) return m.reply('📝 *Uso:*\n!lighthouse <url>')
            pix.lighthouse = url
            writePix(pix)
            return m.reply(`✅ *Lighthouse configurado!*\n\n🔗 ${url}`)
        }
    }
}

handler.help = ['pix', 'pixdados', 'chavepix', 'tokenpix', 'setmercadopago']
handler.tags = ['pix', 'owner']
handler.command = ['pix', 'pixcidade', 'pixdados', 'chavepix', 'dadospix', 'tokenpix', 'token-pix', 'setmercadopago', 'setmp', 'mp', 'lighthouse']

export default handler
