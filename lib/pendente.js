/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Comando Pendente
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Quando o usuário clica num comando do menu que precisa de mídia
 * (sticker, ttp, toimg, efeitos...), o comando é executado mas fica
 * "pendente". A próxima mensagem com mídia do mesmo usuário é
 * tratada como resposta/quoted automatically.
 *
 * Isso permite usar comandos que dependem de reply/mark direto
 * pelo menu, sem precisar digitar o comando de novo.
 */

/** Tempo que o comando fica pendente (ms). */
const TTL = 90 * 1000

/** Mapa: userId -> { comando, chatId, em, texto } */
const pendentes = new Map()

/**
 * Registra um comando pendente para o usuário.
 *
 * @param {string} userId
 * @param {string} chatId
 * @param {string} comando  ex: 'sticker'
 * @param {string} texto    texto original (args)
 */
export function setPendente(userId, chatId, comando, texto = '') {
    pendentes.set(userId, {
        comando,
        chatId,
        texto,
        em: Date.now()
    })
}

/**
 * Pega (sem remover) o comando pendente do usuário.
 */
export function getPendente(userId) {
    const p = pendentes.get(userId)
    if (!p) return null
    if (Date.now() - p.em > TTL) {
        pendentes.delete(userId)
        return null
    }
    return p
}

/**
 * Pega e remove o comando pendente.
 */
export function takePendente(userId) {
    const p = getPendente(userId)
    if (p) pendentes.delete(userId)
    return p
}

/**
 * Remove o comando pendente.
 */
export function clearPendente(userId) {
    pendentes.delete(userId)
}

/**
 * Lista os comandos pendentes (debug).
 */
export function listPendentes() {
    return [...pendentes.entries()].map(([k, v]) => ({ user: k, ...v }))
}

/**
 * Limpa pendentes expirados.
 */
export function limparPendentes() {
    const agora = Date.now()
    for (const [k, v] of pendentes) {
        if (agora - v.em > TTL) pendentes.delete(k)
    }
}

// Limpeza periódica
setInterval(limparPendentes, 30 * 1000).unref?.()

/**
 * Comandos que dependem de mídia/resposta.
 * Usado para decidir se vale a pena avisar o usuário.
 */
export const COMANDOS_COM_MIDIA = new Set([
    'sticker', 's', 'ttp', 'attp', 'toimg', 'togif', 'tomp3', 'tomp4',
    'qc', 'emojimix', 'mix', 'emix', 'rename', 'rn', 'take', 'wm',
    'figuanime', 'figuroblox', 'figuemoji', 'figucoreana', 'figudesenho',
    'figuengracada', 'figuapi', 'figuraiva', 'figurinhaspin',
    'figurinhaspinterest', 'figfundo', 'figusemfundo', 'figvideo',
    'logo', 'logoneon', 'logomatrix', 'logoglitch', 'logosad',
    'logodragonball', 'logopubg', 'logolol', 'logohorror', 'logomaker',
    'logos', 'efeitoimg', 'comprimir', 'compress', 'toaudio', 'toaud',
    'todoc', 'todocument', 'documento', 'topdf', 'print', 'ss', 'ssweb',
    'tts', 'say', 'falar', 'gtts', 'reversevid', 'videolento',
    'videorapido', 'audiolento', 'audiorapido', 'bass', 'deep', 'slow',
    'fast', 'nightcore', 'robot', 'reverse', 'earrape', 'blown', 'fat',
    'smooth', 'tupai', 'bass2', 'bass3', 'slowed', 'speedup'
])

/**
 * Verifica se o comando precisa de mídia.
 */
export function precisaMidia(comando) {
    return COMANDOS_COM_MIDIA.has(String(comando || '').toLowerCase())
}
