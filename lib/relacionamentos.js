/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — base do sistema de relacionamentos
 *
 * Banco de dados:
 *   src/database/relacionamentos.json
 *   src/database/familia.json
 *
 * Estrutura relacionamentos:
 *   { "<grupo>": { "<jid>": { "parceiro": "<jid>", "status": "namorando" | "casado" } } }
 *
 * Estrutura família:
 *   { "<grupo>": { "<jid>": { "pai": "<jid>", "filhos": [], "irmaos": [], "esposas": [] } } }
 */

import fs from 'node:fs'
import path from 'node:path'

const DB_DIR = path.join(process.cwd(), 'src', 'database')
const REL_FILE = path.join(DB_DIR, 'relacionamentos.json')
const FAM_FILE = path.join(DB_DIR, 'familia.json')

function garantirPasta() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
}

function lerArquivo(arquivo) {
    try {
        garantirPasta()
        if (!fs.existsSync(arquivo)) {
            fs.writeFileSync(arquivo, '{}', 'utf-8')
            return {}
        }
        const bruto = fs.readFileSync(arquivo, 'utf-8').trim()
        if (!bruto) return {}
        const dados = JSON.parse(bruto)
        return dados && typeof dados === 'object' ? dados : {}
    } catch (e) {
        console.error('[RELACIONAMENTOS DB] Falha ao ler', arquivo, e?.message || e)
        return {}
    }
}

function salvarArquivo(arquivo, dados) {
    garantirPasta()
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), 'utf-8')
}

export const lerRelacionamentos = () => lerArquivo(REL_FILE)
export const salvarRelacionamentos = (dados) => salvarArquivo(REL_FILE, dados)
export const lerFamilia = () => lerArquivo(FAM_FILE)
export const salvarFamilia = (dados) => salvarArquivo(FAM_FILE, dados)

/** Remove o sufixo de dispositivo (":12") de um JID. */
export function cleanJid(jid) {
    return String(jid || '').replace(/:\d+/g, '').trim()
}

/** Compara dois JIDs tolerando sufixo de dispositivo, caixa e servidor. */
export function mesmaPessoa(a, b) {
    const x = cleanJid(a).toLowerCase()
    const y = cleanJid(b).toLowerCase()
    if (!x || !y) return false
    if (x === y) return true
    const nx = x.split('@')[0].replace(/\D/g, '')
    const ny = y.split('@')[0].replace(/\D/g, '')
    return !!nx && !!ny && nx === ny
}

/** Retorna { parceiro, status } do usuário no grupo, ou null. */
export function getRelacionamentoStatus(groupJid, jid) {
    const grupo = lerRelacionamentos()[groupJid] || {}
    const alvo = cleanJid(jid)
    if (grupo[alvo]) return grupo[alvo]
    const chave = Object.keys(grupo).find((k) => mesmaPessoa(k, alvo))
    return chave ? grupo[chave] : null
}

/** Descobre o alvo do comando: menção primeiro, depois resposta. */
export function getAlvo(m) {
    const mencionado = m.mentionedJid?.[0]
    if (mencionado) return cleanJid(mencionado)
    const respondido = m.quoted?.sender
    if (respondido) return cleanJid(respondido)
    return null
}

/** Envia texto já com as menções corretas (nomes ficam azuis). */
export async function enviarComMencoes(conn, m, texto, mencoes = []) {
    const mentions = [...new Set(mencoes.filter(Boolean).map(cleanJid))]
    return conn.sendMessage(m.chat, { text: texto, mentions }, { quoted: m })
}

function extrairTexto(message) {
    if (!message) return ''
    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.buttonsResponseMessage?.selectedDisplayText ||
        message.listResponseMessage?.title ||
        message.templateButtonReplyMessage?.selectedDisplayText ||
        ''
    )
}

/**
 * Espera a resposta ("sim" / "não") da pessoa alvo no grupo.
 * Resolve com 'sim', 'não' ou null (tempo esgotado).
 */
export function esperarResposta(conn, chat, alvo, { timeout = 60000 } = {}) {
    return new Promise((resolve) => {
        let finalizado = false

        const encerrar = (valor) => {
            if (finalizado) return
            finalizado = true
            clearTimeout(timer)
            try { conn.ev.off('messages.upsert', listener) } catch { /* ignora */ }
            resolve(valor)
        }

        const timer = setTimeout(() => encerrar(null), timeout)

        const listener = (evento) => {
            try {
                const mensagens = evento?.messages || []
                for (const msg of mensagens) {
                    if (!msg?.message || msg.key?.fromMe) continue
                    if (!mesmaPessoa(msg.key?.remoteJid, chat)) continue

                    const autor = msg.key?.participant || msg.participant || msg.key?.remoteJid
                    if (!mesmaPessoa(autor, alvo)) continue

                    const texto = extrairTexto(msg.message).toLowerCase().trim()
                    if (texto === 'sim' || texto === 's') return encerrar('sim')
                    if (texto === 'não' || texto === 'nao' || texto === 'n') return encerrar('não')
                }
            } catch { /* ignora mensagens malformadas */ }
        }

        if (!conn?.ev?.on) return encerrar(null)
        conn.ev.on('messages.upsert', listener)
    })
}
