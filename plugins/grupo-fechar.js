/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

// Nó binário que o WhatsApp exige pra renderizar botões nativos
// (nativeFlowMessage). Sem ele, o relayMessage completa sem erro mas o
// WhatsApp descarta a mensagem em silêncio. (mesmo helper do seu menu.js)
function buildInteractiveNodes(chatId) {
    const nodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                    ]
                }
            ]
        }
    ]

    if (!chatId.endsWith('@g.us')) {
        nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
    }

    return nodes
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Definindo a ação baseado no comando ou no argumento
    // Se digitar .abrir ou .fechar direto, ou .grupo abrir
    let isClose = /fechar|close/i.test(command) || (args[0] && /fechar|close/i.test(args[0]))
    let setting = isClose ? 'announcement' : 'not_announcement'

    // --- Passo 1: mudar a configuração do grupo (isolado do envio da msg) ---
    try {
        await conn.groupSettingUpdate(m.chat, setting)
    } catch (e) {
        console.error('[GRUPO] Erro ao mudar setting:', e)
        return m.reply(`*🦇 Erro:* Não foi possível alterar o status do grupo: ${e.message || e}`)
    }

    // --- Passo 2: avisar no grupo, com botão do canal (se der erro, não desfaz o passo 1) ---
    let status = isClose ? 'FECHADO ! 🔒' : 'ABERTO ! 🔓'
    let texto = `*✅ GRUPO ${status}*\n\n> Configurações do grupo atualizadas com sucesso.`

    const interactiveMessage = {
        header: { hasMediaAttachment: false },
        body: { text: texto },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "✦ 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
                        url: global.canal
                    })
                }
            ]
        }
    }

    try {
        let msgi = generateWAMessageFromContent(m.chat, {
            interactiveMessage
        }, { userJid: conn.user.id, quoted: m })

        await conn.relayMessage(m.chat, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(m.chat)
        })
    } catch (e) {
        // Loga o erro REAL do botão pra investigarmos, mas não falha o comando por isso
        console.error('[GRUPO] Erro ao enviar msg com botão, caindo pro texto simples:', e)
        await conn.sendMessage(m.chat, { text: texto }, { quoted: m }).catch(() => {})
    }

    await m.react(isClose ? '🔒' : '🔓').catch(() => {})
}

handler.help = ['grupo']
handler.tags = ['admin']
// Registrando nomes simples que o seu handler reconhece
handler.command = ['abrir', 'fechar', 'open', 'close']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.register = false

export default handler