/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 *
 * @project Gótica Bot - Efeitos de Logo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Efeitos de texto extras no estilo do menu de logos.
 * Cada comando gera a imagem com o texto digitado pelo usuário:
 *
 *   !glitch Gótica Bot
 *
 * O cliente do ephoto360 é o `lib/ephoto360.js`, escrito para nunca
 * derrubar o bot quando um efeito falha.
 */

import { criarTexto } from '../lib/ephoto360.js'

/**
 * Mapa: comando -> página do efeito.
 * As URLs foram levantadas do sitemap público do ephoto360 e
 * conferidas uma a uma (todas respondem com o formulário de criação).
 */
export const EFEITOS = {
    '1917': 'https://en.ephoto360.com/1917-effect-text-online-518.html',
    '3druby': 'https://en.ephoto360.com/3d-ruby-stone-text-281.html',
    'advancedglow': 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    'blackpinklogo': 'https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html',
    'blood': 'https://en.ephoto360.com/blood-writing-text-online-77.html',
    'cartoon': 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    'cemetery': 'https://en.ephoto360.com/write-your-name-on-horror-cemetery-gate-726.html',
    'clouds': 'https://en.ephoto360.com/create-realistic-cloud-text-effect-606.html',
    'darkgreen': 'https://en.ephoto360.com/dark-green-typography-online-359.html',
    'deleting': 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    'dragonball': 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
    'effectclouds': 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    'flag': 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    'flag3d': 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    'freecreate': 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    'frozen': 'https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html',
    'galaxy': 'https://en.ephoto360.com/galaxy-text-effect-116.html',
    'galaxywallpaper': 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    'glitch': 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    'glowing': 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    'gradient': 'https://en.ephoto360.com/create-gradient-logo-3d-online-476.html',
    'halloween': 'https://en.ephoto360.com/text-halloween-80.html',
    'horror': 'https://en.ephoto360.com/writing-horror-text-online-266.html',
    'joker': 'https://en.ephoto360.com/create-avatar-online-style-joker-365.html',
    'ligatures': 'https://en.ephoto360.com/ligatures-effects-from-leaves-146.html',
    'lighteffects': 'https://en.ephoto360.com/create-light-effects-green-neon-online-429.html',
    'luxurygold': 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    'makingneon': 'https://en.ephoto360.com/neon-text-effect-171.html',
    'metal3d': 'https://en.ephoto360.com/text-metal-3d-277.html',
    'multicoloredneon': 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
    'neondevil': 'https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html',
    'neonglitch': 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    'papercut': 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    'pixelglitch': 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    'royal': 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    'sandsummer': 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    'summerbeach': 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    'sunset': 'https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html',
    'typography': 'https://en.ephoto360.com/typography-maker-online-5-343.html',
    'underwater': 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    'watercolor': 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    'wooden3d': 'https://en.ephoto360.com/wooden-3d-text-effect-59.html',
    'write': 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html'
}

/** Evita spam: um logo por usuário a cada 15 segundos. */
const cooldown = new Map()
const COOLDOWN_MS = 15000

const handler = async (m, { conn, args, command, usedPrefix }) => {
    const cmd = (command || '').toLowerCase()
    const url = EFEITOS[cmd]
    if (!url) return

    const texto = (args || []).join(' ').trim()
    if (!texto) {
        return m.reply(
            `🎨 *Gótica Bot — Efeitos de Logo*\n\n` +
            `📝 *Uso:* \`${usedPrefix}${cmd} <texto>\`\n` +
            `💡 *Exemplo:* \`${usedPrefix}${cmd} Gótica Bot\`\n\n` +
            `✦ *Texto com espaços:* tudo depois do comando vira o texto.`
        )
    }

    const agora = Date.now()
    const ultimo = cooldown.get(m.sender) || 0
    if (agora - ultimo < COOLDOWN_MS) {
        const resta = Math.ceil((COOLDOWN_MS - (agora - ultimo)) / 1000)
        return m.reply(`⏳ *Calma, vampiro.* Aguarde ${resta}s para o próximo logo.`)
    }
    cooldown.set(m.sender, agora)

    try {
        await m.reply('🖤 *Preparando seu logo na cripta...*')

        const linhas = texto.split('|').map(s => s.trim()).filter(Boolean)
        const imagem = await criarTexto(url, linhas.length ? linhas : [texto])

        if (!imagem) {
            return m.reply('❌ *Não consegui gerar esse efeito agora.* Tente outro comando ou tente novamente em instantes.')
        }

        // Alguns efeitos devolvem vídeo em vez de imagem.
        const ehVideo = /\.(mp4|webm|mov)(\?|$)/i.test(imagem)
        const midia = ehVideo ? { video: { url: imagem } } : { image: { url: imagem } }

        await conn.sendMessage(m.chat, {
            ...midia,
            caption: `✅ *Logo criado!* ✦\n\n🎨 Efeito: \`${cmd}\`\n✒️ Texto: ${texto}`,
            contextInfo: { externalAdReply: {
                title: '☾ 𝖦𝗈́𝗍𝗂𝖼𝖺 𝖡𝗈𝗍 𝖯𝗂𝗇𝗀 𝖲𝗒𝗌𝗍𝖾𝗆 ☽',
                body: 'Logos com efeitos',
                thumbnailUrl: 'https://files.catbox.moe/yyk5xo.jpg',
                sourceUrl: 'https://github.com/leandromemes',
                mediaType: 1,
                renderLargerThumbnail: true
            } }
        }, { quoted: m })
    } catch (e) {
        console.error('[LOGOS EFEITOS]', cmd, e)
        await m.reply('❌ *Erro ao gerar o logo.* Tente novamente mais tarde.')
    }
}

handler.help = Object.keys(EFEITOS).map(c => `${c} <texto>`)
handler.tags = ['logos']
handler.command = Object.keys(EFEITOS)
handler.register = false

export default handler
