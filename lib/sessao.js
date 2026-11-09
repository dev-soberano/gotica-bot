/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Detecção de Sessão
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Detecta se já existe uma sessão salva no disco para decidir se
 * precisa mostrar o menu de QR Code / Código de Pareamento.
 *
 * O campo `creds.registered` não é mais preenchido pelas versões
 * recentes do Baileys (RC), então verificamos também a assinatura
 * da conta (`me.id` + `accountSignature`) que só existe após o
 * pareamento/QR concluído.
 */

import fs from 'fs'
import path from 'path'

/**
 * Verifica se os credenciais indicam uma sessão válida.
 *
 * @param {object} creds credenciais do Baileys
 * @returns {boolean}
 */
export function temSessaoValida(creds) {
    if (!creds) return false

    // Caso 1: campo registered (versões antigas do Baileys)
    if (creds.registered === true) return true

    // Caso 2: sessão pareada - tem identidade E assinatura da conta.
    // Esses campos só são gravados depois que o QR/pairing é concluído.
    const temIdentidade = !!(creds.me?.id)
    const temAssinatura = !!(
        creds.account?.accountSignature ||
        creds.account?.accountSignatureKey ||
        creds.signedIdentityKey
    )

    if (temIdentidade && temAssinatura) return true

    // Caso 3: tem identidade mas sem assinatura (login em andamento)
    // Não trata como sessão válida para forçar o usuário a escanear.
    return false
}

/**
 * Lê o creds.json do disco e verifica se há sessão válida.
 *
 * @param {string} sessionPath caminho da pasta de sessão
 * @returns {{ existe: boolean, valida: boolean, meId: string }}
 */
export function verificarSessaoDisco(sessionPath) {
    const resultado = { existe: false, valida: false, meId: '' }

    try {
        const credsFile = path.join(sessionPath, 'creds.json')
        if (!fs.existsSync(credsFile)) return resultado

        resultado.existe = true
        const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'))
        resultado.valida = temSessaoValida(creds)
        resultado.meId = creds?.me?.id || ''
    } catch (e) {
        console.error('[SESSÃO] Erro ao verificar credenciais:', e.message)
    }

    return resultado
}

/**
 * Remove a sessão do disco (deslogar).
 *
 * @param {string} sessionPath
 */
export function apagarSessao(sessionPath) {
    try {
        const credsFile = path.join(sessionPath, 'creds.json')
        if (fs.existsSync(credsFile)) {
            fs.unlinkSync(credsFile)
            return true
        }
    } catch (e) {
        console.error('[SESSÃO] Erro ao apagar credenciais:', e.message)
    }
    return false
}
