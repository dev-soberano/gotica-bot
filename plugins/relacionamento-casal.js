/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('🖤 ❌ Este comando só pode ser usado em grupos.')

    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let participants = groupMetadata.participants
            .filter(v => !v.id.includes('broadcast'))
            .map(v => v.id)

        if (participants.length < 2) return m.reply('🥀 Membros insuficientes no grupo para formar um casal.')

        // Sorteio de dois membros aleatórios e distintos
        let p1 = participants[Math.floor(Math.random() * participants.length)]
        let p2 = participants[Math.floor(Math.random() * participants.length)]

        while (p1 === p2) {
            p2 = participants[Math.floor(Math.random() * participants.length)]
        }

        // Mensagens de felicitações sortidas
        let felicitacoes = [
            '✨ Felicidades ao casal!',
            '🙏 Que Deus abençoe essa nova união!',
            '💍 Já estou preparando os convites do casamento!',
            '❤️ Que essa história seja longa e repleta de amor!',
            '🥂 Um brinde a esse novo casal maravilhoso!',
            '👀 O grupo todo já estava desconfiando desse casal!',
            '🎉 Shippo demais! Que sejam muito felizes!'
        ]

        let mensagemSortida = felicitacoes[Math.floor(Math.random() * felicitacoes.length)]

        let mensagem = `
🥀 *O DESTINO UNIU VOCÊS* 🥀
━━━━━━━ 🖤 ━━━━━━━

👩‍❤️‍👨 *Novo Casal Formado:*

        @${p1.split('@')[0]}
                 ❤️
        @${p2.split('@')[0]}

━━━━━━━ 🔮 ━━━━━━━

_${mensagemSortida}_
`.trim()

        await conn.sendMessage(m.chat, { 
            text: mensagem, 
            mentions: [p1, p2] 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('🥀 Não foi possível sortear o casal no momento... tente novamente.')
    }
}

handler.help = ['casal']
handler.tags = ['relacionamento']
handler.command = ['casal', 'novocasal', 'sortearcasal']
handler.register = false 

export default handler