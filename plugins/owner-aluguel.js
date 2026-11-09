/**

 * @project Gótica Bot - Sistema de Aluguel
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de aluguel de grupos portado do Minato:
 *  !plano / !planos       - planos disponiveis
 *  !painelaluguel         - painel de controle
 *  !removeraluguel        - cancela o aluguel
 *  !lista_aluguel         - lista os grupos alugados
 *  !chavepix / !pixdados - dados de pagamento
 *  !editchave             - (dono) define a chave PIX
 *  !modoaluguel on|off    - liga/desliga o aluguel no grupo
 *
 * Nota: !alugar / !veraluguel / !tempoaluguel ja existem na base da
 * Gótica (plugins/dono-*.js) e nao foram duplicados aqui.
 */

import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

const ALUGUEL_FILE = path.join(process.cwd(), 'src', 'dados', 'aluguel.json')
const PLANOS_FILE = path.join(process.cwd(), 'src', 'dados', 'planos.json')
const PIX_FILE = path.join(process.cwd(), 'src', 'dados', 'pix.json')

/** Planos padrao de aluguel. */
const PLANOS_PADRAO = {
    '7': { nome: '7 dias', preco: 50, dias: 7 },
    '15': { nome: '15 dias', preco: 90, dias: 15 },
    '30': { nome: '30 dias', preco: 150, dias: 30 },
    '90': { nome: '90 dias', preco: 350, dias: 90 }
}

/** Le os alugueis. */
function readAluguel() {
    try {
        if (!fs.existsSync(ALUGUEL_FILE)) return { grupos: {}, dados: {} }
        const p = JSON.parse(fs.readFileSync(ALUGUEL_FILE, 'utf-8'))
        return { grupos: p.grupos || {}, dados: p.dados || {} }
    } catch {
        return { grupos: {}, dados: {} }
    }
}

/** Grava os alugueis. */
function writeAluguel(data) {
    try {
        const dir = path.dirname(ALUGUEL_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(ALUGUEL_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Le os planos. */
function readPlanos() {
    try {
        if (!fs.existsSync(PLANOS_FILE)) return structuredClone(PLANOS_PADRAO)
        const p = JSON.parse(fs.readFileSync(PLANOS_FILE, 'utf-8'))
        return (p && typeof p === 'object' && Object.keys(p).length) ? p : structuredClone(PLANOS_PADRAO)
    } catch {
        return structuredClone(PLANOS_PADRAO)
    }
}

/** Le os dados de pagamento (PIX). */
function readPixDados() {
    try {
        if (!fs.existsSync(PIX_FILE)) return {}
        return JSON.parse(fs.readFileSync(PIX_FILE, 'utf-8'))
    } catch {
        return {}
    }
}

/** Grava os dados de pagamento (PIX). */
function writePixDados(data) {
    try {
        const dir = path.dirname(PIX_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(PIX_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Calcula o tempo restante de um aluguel. */
function tempoRestante(expiraEm) {
    const diff = expiraEm - Date.now()
    if (diff <= 0) return { expirado: true, texto: 'expirado' }
    const dias = Math.floor(diff / 86400000)
    const horas = Math.floor((diff % 86400000) / 3600000)
    const min = Math.floor((diff % 3600000) / 60000)
    let txt = ''
    if (dias) txt += `${dias}d `
    if (horas) txt += `${horas}h `
    txt += `${min}min`
    return { expirado: false, texto: txt.trim(), dias, horas, min }
}

const handler = async (m, { args, command, text, isSoberano, isAdmin, groupMetadata }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !plano / !planos ----------
    if (cmd === 'plano' || cmd === 'planos') {
        const planos = readPlanos()
        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  💼 *PLANOS DE ALUGUEL*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        Object.entries(planos).forEach(([k, v], i) => {
            txt += `${i + 1}. *${v.nome}* — ${v.preco} 🪙 (${v.dias} dias)\n`
        })

        txt += `\n💡 \`!alugar <dias>\` para assinar\n`
        txt += `💡 \`!chavepix\` para ver os dados de pagamento`
        return m.reply(txt)
    }

    // ---------- !painelaluguel / !painelalugar ----------
    if (cmd === 'painelaluguel' || cmd === 'painelalugar' || cmd === 'ajudaaluguel' || cmd === 'aluguelhelp') {
        const db = readAluguel()
        const info = m.isGroup ? db.dados[m.chat] : null
        const expiraEm = m.isGroup ? db.grupos[m.chat] : null
        const t = expiraEm ? tempoRestante(expiraEm) : null

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  💼 *PAINEL DE ALUGUEL*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

        if (m.isGroup) {
            txt += `📛 *Grupo:* ${info?.nome || 'Grupo'}\n`
            txt += `📊 *Estado:* ${expiraEm && !t.expirado ? '🟢 ATIVO' : '🔴 INATIVO'}\n`
            if (expiraEm) {
                txt += `⏱️ *Restante:* ${t.expirado ? 'expirado' : t.texto}\n`
                txt += `📅 *Expira:* ${moment(expiraEm).format('DD/MM/YYYY HH:mm')}\n`
            }
            txt += `\n`
        }

        txt += `📋 *Planos:*\n`
        const planos = readPlanos()
        Object.values(planos).forEach((p, i) => {
            txt += `${i + 1}. *${p.nome}* — ${p.preco} 🪙\n`
        })

        txt += `\n💡 *Comandos:*\n`
        txt += `• \`!alugar <dias>\` — assinar\n`
        txt += `• \`!veraluguel\` — ver status\n`
        txt += `• \`!chavepix\` — dados de pagamento`
        return m.reply(txt)
    }

    // ---------- !removeraluguel ----------
    if (cmd === 'removeraluguel' || cmd === 'removealuguel' || cmd === 'rm_aluguel' || cmd === 'rmaluguelgp' || cmd === 'removeraluguelgp') {
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const db = readAluguel()
        const target = m.isGroup ? m.chat : args[0]
        if (!target) return m.reply('📝 *Uso:*\n!removeraluguel [jid do grupo]')
        if (!db.grupos[target]) return m.reply('❌ *Este grupo não possui aluguel ativo.*')
        delete db.grupos[target]
        delete db.dados[target]
        writeAluguel(db)
        return m.reply(`🗑️ *Aluguel removido!*\n\n📍 \`${target}\``)
    }

    // ---------- !lista_aluguel ----------
    if (cmd === 'lista_aluguel' || cmd === 'listaluguel') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const db = readAluguel()
        const chaves = Object.keys(db.grupos)

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  💼 *GRUPOS ALUGADOS*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `📊 *Total:* ${chaves.length}\n\n`

        chaves.forEach((g, i) => {
            const t = tempoRestante(db.grupos[g])
            const info = db.dados[g] || {}
            txt += `${i + 1}. *${info.nome || 'Grupo'}*\n   ⏱️ ${t.expirado ? '❌ expirado' : t.texto}\n   🆔 \`${g}\`\n`
        })

        if (!chaves.length) txt += `_Nenhum grupo alugado._`
        return m.reply(txt)
    }

    // ---------- !chavepix / !pixdados / !dadospix / !editchave ----------
    if (cmd === 'chavepix' || cmd === 'pixdados' || cmd === 'dadospix' || cmd === 'editchave') {
        const pix = readPixDados()

        if (cmd === 'editchave') {
            if (!isSoberano) return m.reply(global.dfail('owner'))
            const chave = args[0]
            if (!chave) return m.reply('📝 *Uso:*\n!editchave <chave pix>')
            pix.chave = chave
            writePixDados(pix)
            return m.reply(`✅ *Chave PIX atualizada!*\n\n🔑 ${chave}`)
        }

        if (!pix.chave && !pix.titular) {
            return m.reply('🔑 *DADOS DE PAGAMENTO*\n\n❌ Ainda não configurados pelo dono.\n\n💡 O dono pode definir com `!editchave <chave>`.')
        }

        let txt = `🔑 *DADOS DE PAGAMENTO*\n\n`
        if (pix.titular) txt += `👤 *Titular:* ${pix.titular}\n`
        if (pix.chave) txt += `🔑 *Chave:* ${pix.chave}\n`
        if (pix.cpf) txt += `📄 *CPF:* ${pix.cpf}\n`
        if (pix.banco) txt += `🏦 *Banco:* ${pix.banco}\n`
        txt += `\n💡 *Faça o pix e envie o comprovante.*`
        return m.reply(txt)
    }

    // ---------- !modoaluguel ----------
    if (cmd === 'modoaluguel') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const db = readAluguel()
        const arg = (args[0] || '').toLowerCase()
        const chave = `modo:${m.chat}`

        if (arg === 'on' || arg === 'ativar' || arg === '1') {
            db.dados[chave] = { ...(db.dados[chave] || {}), modoAluguel: true }
            writeAluguel(db)
            return m.reply('💼 *MODO ALUGUEL ATIVADO!*')
        }
        if (arg === 'off' || arg === 'desativar' || arg === '0') {
            db.dados[chave] = { ...(db.dados[chave] || {}), modoAluguel: false }
            writeAluguel(db)
            return m.reply('🔕 *MODO ALUGUEL DESATIVADO!*')
        }
        const ativo = db.dados[chave]?.modoAluguel
        return m.reply(`💼 *MODO ALUGUEL*\n\n📊 Estado: ${ativo ? '🟢 ATIVO' : '🔴 INATIVO'}\n\n💡 \`!modoaluguel on\` / \`!modoaluguel off\``)
    }
}

handler.help = ['plano', 'planos', 'painelaluguel', 'removeraluguel', 'lista_aluguel', 'chavepix']
handler.tags = ['owner', 'aluguel']
handler.command = ['plano', 'planos', 'coletaraluguel', 'aguardar_aluguel', 'aguardar',
    'removeraluguel', 'removealuguel', 'rm_aluguel', 'rmaluguelgp', 'removeraluguelgp',
    'lista_aluguel', 'listaluguel', 'painelaluguel', 'painelalugar', 'ajudaaluguel', 'aluguelhelp',
    'chavepix', 'pixdados', 'dadospix', 'editchave', 'modoaluguel']

export default handler
