/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Botões Interativos (nativeFlowMessage)
 * @author Dev Soberano
 * @link https://github.com/leandromemes
 *
 * Adaptado do sistema do Minato Bot. O WhatsApp exige um nó `biz`
 * extra no relayMessage para renderizar os botões nativos; sem ele a
 * mensagem é enviada mas o WhatsApp descarta em silêncio.
 */

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys'

/**
 * Monta o contextInfo unindo menções e contexto existente.
 */
function buildContextInfo({ mentions = [], contextInfo = {} } = {}) {
    const merged = { ...(contextInfo || {}) }
    if (Array.isArray(mentions) && mentions.length) {
        merged.mentionedJid = [...new Set([...(merged.mentionedJid || []), ...mentions])]
    }
    return Object.keys(merged).length ? merged : undefined
}

/**
 * Monta o conteúdo interativo (interactiveMessage) a partir de um payload.
 */
export function generateInteractiveMessage(payload = {}) {
    const interactiveMessage = {
        body: {
            text: String(payload.text || payload.body || payload.caption || '')
        },
        footer: payload.footer ? { text: String(payload.footer) } : undefined,
        header: {
            title: payload.title ? String(payload.title) : undefined,
            subtitle: payload.subtitle ? String(payload.subtitle) : undefined,
            hasMediaAttachment: !!payload.hasMediaAttachment
        },
        contextInfo: buildContextInfo({
            mentions: payload.mentions,
            contextInfo: payload.contextInfo
        }) || {},
        nativeFlowMessage: {
            buttons: Array.isArray(payload.interactiveButtons) ? payload.interactiveButtons : [],
            messageParamsJson: '{}',
            messageVersion: 1
        }
    }

    return {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
    }
}

/**
 * Desembrulha conteúdo de viewOnce para achar o interactiveMessage.
 */
function unwrapInteractiveContent(content = {}) {
    return content?.viewOnceMessage?.message?.interactiveMessage
        ? { interactiveMessage: content.viewOnceMessage.message.interactiveMessage }
        : content
}

/**
 * Decide qual nó `biz` precisa ser injetado para o tipo de botão.
 */
function getButtonTransportNode(content = {}) {
    const message = unwrapInteractiveContent(content)
    const nativeFlow = message?.interactiveMessage?.nativeFlowMessage
    const carouselButtons = message?.interactiveMessage?.carouselMessage?.cards
        ?.some(card => Array.isArray(card?.nativeFlowMessage?.buttons) && card.nativeFlowMessage.buttons.length)
    const firstButtonName = nativeFlow?.buttons?.[0]?.name

    const nativeFlowSpecials = [
        'mpm',
        'cta_catalog',
        'send_location',
        'call_permission_request',
        'wa_payment_transaction_details',
        'automated_greeting_message_view_catalog'
    ]

    // Botões de pagamento exigem um nome de fluxo específico.
    if (nativeFlow && (firstButtonName === 'review_and_pay' || firstButtonName === 'payment_info')) {
        return {
            tag: 'biz',
            attrs: {
                native_flow_name: firstButtonName === 'review_and_pay' ? 'order_details' : firstButtonName
            }
        }
    }

    if (nativeFlow && nativeFlowSpecials.includes(firstButtonName)) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'interactive',
                attrs: { type: 'native_flow', v: '1' },
                content: [{
                    tag: 'native_flow',
                    attrs: { v: '2', name: firstButtonName }
                }]
            }]
        }
    }

    // Botões "mixed" (quick_reply + url + call_to_action) - padrão dos menus.
    if (nativeFlow || carouselButtons || message?.buttonsMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'interactive',
                attrs: { type: 'native_flow', v: '1' },
                content: [{
                    tag: 'native_flow',
                    attrs: { v: '9', name: 'mixed' }
                }]
            }]
        }
    }

    // Listas (listMessage)
    if (message?.listMessage) {
        return {
            tag: 'biz',
            attrs: {},
            content: [{
                tag: 'list',
                attrs: { v: '2', type: 'product_list' }
            }]
        }
    }

    return null
}

/**
 * Envia uma mensagem interativa (botões) com o transporte correto.
 *
 * @param {object} sock  conexão baileys
 * @param {string} jid   chat de destino
 * @param {object} content  { interactiveMessage: {...} }
 * @param {object} options { quoted, timestamp }
 */
export async function relayButtonMessage(sock, jid, content, options = {}) {
    const isCarouselMessage = !!content?.interactiveMessage?.carouselMessage

    const msg = isCarouselMessage
        ? generateWAMessageFromContent(jid, content, {})
        : generateWAMessageFromContent(jid, content, {
            quoted: options.quoted,
            userJid: sock?.user?.id,
            timestamp: options.timestamp || new Date()
        })

    const buttonsNode = isCarouselMessage ? null : getButtonTransportNode(content)
    const additionalNodes = []
    if (buttonsNode) additionalNodes.push(buttonsNode)

    await sock.relayMessage(jid, msg.message, {
        messageId: msg.key.id,
        additionalNodes: additionalNodes.length ? additionalNodes : undefined
    })

    return msg
}

/**
 * Envia um interactiveMessage montando tudo a partir de um payload simples.
 */
export async function sendInteractive(sock, jid, payload = {}, options = {}) {
    const content = generateInteractiveMessage(payload)
    return relayButtonMessage(sock, jid, content, options)
}

/**
 * Envia botões com imagem no header.
 */
export async function sendInteractiveImageButtons(sock, jid, {
    image,
    body = '',
    footer = '',
    title,
    subtitle,
    buttons = [],
    contextInfo = {},
    mentions = []
}, options = {}) {
    const media = await prepareWAMessageMedia(
        { image },
        options.mediaOptions || { upload: sock.waUploadToServer }
    )

    return relayButtonMessage(sock, jid, {
        interactiveMessage: {
            header: {
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
            },
            headerType: 'IMAGE',
            body: { text: String(body || '') },
            footer: { text: String(footer || '') },
            contextInfo,
            nativeFlowMessage: {
                buttons: Array.isArray(buttons) ? buttons : [],
                messageParamsJson: '{}',
                messageVersion: 1
            }
        }
    }, options)
}

/**
 * Envia botões com vídeo no header (mantém os vídeos da Gótica no menu).
 */
export async function sendInteractiveVideoButtons(sock, jid, {
    video,
    gifPlayback = true,
    body = '',
    footer = '',
    title,
    subtitle,
    buttons = [],
    contextInfo = {},
    mentions = []
}, options = {}) {
    const media = await prepareWAMessageMedia(
        { video, gifPlayback },
        options.mediaOptions || { upload: sock.waUploadToServer }
    )

    return relayButtonMessage(sock, jid, {
        interactiveMessage: {
            header: {
                hasMediaAttachment: true,
                videoMessage: media.videoMessage
            },
            headerType: 'VIDEO',
            body: { text: String(body || '') },
            footer: { text: String(footer || '') },
            contextInfo,
            nativeFlowMessage: {
                buttons: Array.isArray(buttons) ? buttons : [],
                messageParamsJson: '{}',
                messageVersion: 1
            }
        }
    }, options)
}

/**
 * Cria um botão de resposta rápida (executa um comando ao clicar).
 *
 * @param {string} id      identificador (vira o texto do comando)
 * @param {string} text    rótulo exibido
 */
export function quickReply(id, text) {
    return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: text,
            id: String(id)
        })
    }
}

/**
 * Cria um botão de link (CTA URL).
 */
export function ctaUrl(text, url) {
    return {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
            display_text: text,
            url: String(url)
        })
    }
}

/**
 * Cria um botão de chamada.
 */
export function callButton(text, phoneNumber) {
    return {
        name: 'call_to_action',
        buttonParamsJson: JSON.stringify({
            display_text: text,
            phone_number: String(phoneNumber)
        })
    }
}

/**
 * Extrai o ID do botão clicado de uma mensagem de resposta interativa.
 * Retorna string vazia se não for um clique de botão.
 */
export function extractButtonId(rawMessage) {
    try {
        const rawInteractive = rawMessage?.interactiveResponseMessage
        if (rawInteractive?.nativeFlowResponseMessage?.paramsJson) {
            return JSON.parse(rawInteractive.nativeFlowResponseMessage.paramsJson)?.id || ''
        }
        if (rawMessage?.templateButtonReplyMessage?.selectedId) {
            return rawMessage.templateButtonReplyMessage.selectedId
        }
        if (rawMessage?.buttonsResponseMessage?.selectedButtonId) {
            return rawMessage.buttonsResponseMessage.selectedButtonId
        }
        if (rawMessage?.listResponseMessage?.singleSelectReply?.selectedRowId) {
            return rawMessage.listResponseMessage.singleSelectReply.selectedRowId
        }
    } catch { }
    return ''
}
