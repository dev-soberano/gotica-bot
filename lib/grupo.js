/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 *
 * @project Gótica Bot - Utilidades de grupo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Leitura e escrita da configuração de cada grupo.
 * Tudo fica em `src/database/grupos/<id do grupo>.json` no formato:
 *
 *   [ { "chave": "valor", ... } ]
 *
 * (um array com um único objeto, igual ao padrão do Minato, para
 *  manter a compatibilidade com os plugins que já existiam).
 */

import fs from 'fs'
import path from 'path'

const DIR_GRUPOS = path.join(process.cwd(), 'src', 'database', 'grupos')

/** Normaliza o JID do grupo para o nome do arquivo. */
export function chaveGrupo(chatJid) {
    if (!chatJid || !chatJid.endsWith('@g.us')) return null
    return chatJid.split('@')[0] + '@g.us'
}

/** Caminho do arquivo de configuração do grupo. */
export function caminhoGrupo(chatJid) {
    const chave = chaveGrupo(chatJid)
    if (!chave) return null
    return path.join(DIR_GRUPOS, `${chave}.json`)
}

/** Lê a configuração do grupo (objeto). Nunca lança. */
export function lerGrupo(chatJid) {
    const file = caminhoGrupo(chatJid)
    if (!file || !fs.existsSync(file)) return {}
    try {
        const bruto = JSON.parse(fs.readFileSync(file, 'utf-8'))
        return Array.isArray(bruto) ? (bruto[0] || {}) : (bruto || {})
    } catch (e) {
        return {}
    }
}

/** Grava a configuração do grupo. Nunca lança. */
export function gravarGrupo(chatJid, config) {
    const file = caminhoGrupo(chatJid)
    if (!file) return false
    try {
        if (!fs.existsSync(DIR_GRUPOS)) fs.mkdirSync(DIR_GRUPOS, { recursive: true })
        fs.writeFileSync(file, JSON.stringify([config], null, 2), 'utf-8')
        return true
    } catch (e) {
        console.error('[GRUPO] erro ao gravar:', e)
        return false
    }
}

/** Atualiza a configuração aplicando uma função. */
export function atualizarGrupo(chatJid, fn) {
    const config = lerGrupo(chatJid)
    const novo = fn(config) || config
    gravarGrupo(chatJid, novo)
    return novo
}

/** Lê um arquivo JSON simples do `src/dados`, tolerando ausência. */
export function lerDado(nome, padrao = []) {
    const file = path.join(process.cwd(), 'src', 'dados', nome)
    try {
        if (!fs.existsSync(file)) return padrao
        return JSON.parse(fs.readFileSync(file, 'utf-8'))
    } catch (e) {
        return padrao
    }
}

/** Grava um arquivo JSON simples do `src/dados`, criando a pasta. */
export function gravarDado(nome, dados) {
    const file = path.join(process.cwd(), 'src', 'dados', nome)
    try {
        const dir = path.dirname(file)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(file, JSON.stringify(dados, null, 2), 'utf-8')
        return true
    } catch (e) {
        console.error('[DADOS] erro ao gravar', nome, e)
        return false
    }
}

/** Remove o número de qualquer texto, deixando só dígitos. */
export function somenteDigitos(texto) {
    return String(texto || '').replace(/\D/g, '')
}

/** Converte um número (com ou sem @s.whatsapp.net) em JID. */
export function paraJid(numero) {
    const n = somenteDigitos(numero)
    if (!n) return null
    return `${n}@s.whatsapp.net`
}

/** Formata um número para exibição: 55 54 9 9944-4162 */
export function formatarNumero(numero) {
    const n = somenteDigitos(numero)
    if (!n) return '—'
    if (n.length <= 2) return n
    if (n.length <= 6) return `${n.slice(0, 2)} ${n.slice(2)}`
    if (n.length <= 10) return `${n.slice(0, 2)} ${n.slice(2, n.length - 4)}-${n.slice(-4)}`
    return `${n.slice(0, 2)} ${n.slice(2, n.length - 4)}-${n.slice(-4)}`
}
