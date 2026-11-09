/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — Antiflood ultra-rápido (Sem travamento por rate-limit)
 *
 * ALTERAÇÃO: a mensagem de aviso agora é enviada ANTES do ban — se banir
 * primeiro, a pessoa já foi removida do grupo e não vê o aviso explicando
 * o motivo.
 */

import fs from 'fs'
import path from 'path'

const DB_DIR = path.join(process.cwd(), 'src', 'database', 'grupos')

const limpar = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
const ehAdmin = p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true
const idsDe = p => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limpar)

function readGroupConfig(groupJid) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
    const cleanFrom = groupJid.split('@')[0] + '@g.us'
    const p = path.join(DB_DIR, `${cleanFrom}.json`)
    if (fs.existsSync(p)) {
        try {
            const raw = fs.readFileSync(p, 'utf-8')
            const parsed = raw ? JSON.parse(raw) : []
            const arr = Array.isArray(parsed) ? parsed : [parsed]
            return arr[0] || {}
        } catch (e) {
            return {}
        }
    }
    return {}
}

global.floodStore = global.floodStore || {}

export async function before(m, { conn, participants, groupMetadata, isSoberano, isOwner, isAdmin, isBotAdmin }) {
    try {
        if (!m.isGroup || !m.sender) return

        const senderClean = limpar(m.sender)

        // 1. RECONHECIMENTO ABSOLUTO DE DONO / SOBERANO / BOT
        const ownerNumbers = global.owner ? global.owner.map(v => String(v[0]).replace(/[^0-9]/g, '')) : []
        const isBotOwner = ownerNumbers.includes(senderClean) || isSoberano || isOwner || m.key?.fromMe
        if (isBotOwner) return

        // 2. VERIFICAÇÃO DO ESTADO NO BANCO FÍSICO
        const cfg = readGroupConfig(m.chat)
        const isAntiFloodAtivo = !!(cfg.antiflood === true || cfg.antiFlood === true || cfg.antifloodgp === true)
        if (!isAntiFloodAtivo) return

        const listaMembros = participants || groupMetadata?.participants || []
        const participanteClean = limpar(m.sender)

        // 3. VERIFICA SE QUEM ENVIOU É ADMIN DO GRUPO
        const senderAdmin = (isAdmin === true) || listaMembros.some(p => idsDe(p).includes(participanteClean) && ehAdmin(p))
        if (senderAdmin) return

        // 4. CHECAGEM BLINDADA DO BOT COMO ADMIN
        const rawBotJid = conn.user?.id || conn.user?.jid || ''
        const botNumberClean = limpar(rawBotJid)
        const botLid = limpar(conn.user?.lid || '')

        const botIsAdminCalculated = (isBotAdmin === true) || listaMembros.some(p => {
            const ids = idsDe(p)
            return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
        })

        if (!botIsAdminCalculated) return

        // 5. CONTAGEM E REGRA DE FLOOD
        const limite = cfg.floodLimite ?? 5
        const janelaSeg = cfg.floodJanela ?? 4
        const janelaMs = janelaSeg * 1000

        const key = `${m.chat}-${senderClean}`
        const agora = Date.now()
        const historico = (global.floodStore[key] || []).filter(ts => agora - ts < janelaMs)
        historico.push(agora)
        global.floodStore[key] = historico

        if (historico.length >= limite) {
            global.floodStore[key] = [] // Zera imediatamente para não entrar em loop

            // PASSO 1: MANDA O AVISO PRIMEIRO — a pessoa ainda está no
            // grupo nesse momento, então vê o motivo antes de ser removida
            const texto =
                `*🚨 ANTIFLOOD*\n\n` +
                `_Opa!_ @${senderClean} vai ser *REMOVIDO* ⚠️\n\n` +
                `> Motivo: enviou *${historico.length} mensagens* em menos de *${janelaSeg}s*.\n` +
                `> Limite configurado: ${limite} msgs em ${janelaSeg}s = ban.\n\n`

            await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] }).catch(() => {})

            // PASSO 2: APAGA A MENSAGEM DO FLOOD
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant || m.sender
                }
            }).catch(() => {})

            // PASSO 3: BANE (agora sim, depois do aviso já ter sido visto)
            console.log(`[ANTIFLOOD] Banindo ${m.sender} de ${m.chat}...`)
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(e => {
                console.error('[ANTIFLOOD] Erro no banimento:', e.message)
            })
        }
    } catch (e) {
        console.error('[ANTIFLOOD] Erro no middleware:', e)
    }
}