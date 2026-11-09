/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('🌈 ❌ Este comando só pode ser usado em grupos.')

    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let participants = groupMetadata.participants
            .filter(v => !v.id.includes('broadcast'))
            .map(v => v.id)

        if (participants.length < 2) return m.reply('🏳️‍🌈 Membros insuficientes no grupo para formar um casal.')

        // Sorteio de dois membros aleatórios e distintos
        let p1 = participants[Math.floor(Math.random() * participants.length)]
        let p2 = participants[Math.floor(Math.random() * participants.length)]

        while (p1 === p2) {
            p2 = participants[Math.floor(Math.random() * participants.length)]
        }

        // Mensagens de felicitações sortidas
        let felicitacoes = [
            '✨ Toda forma de amor é justa e valiosa! Felicidades!',
            '🌈 O amor sempre vence! Que sejam muito felizes!',
            '💍 Viva o amor! Já quero convite para o casamento!',
            '👑 O casal mais estiloso e lindo do grupo!',
            '💖 Muita luz e parceria nessa nova caminhada!',
            '🎉 O grupo todo aprova esse casal perfeito!',
            '🥂 Um brinde a esse encontro de almas!'
        ]

        let mensagemSortida = felicitacoes[Math.floor(Math.random() * felicitacoes.length)]

        let mensagem = `
🏳️‍🌈 *O AMOR UNIU VOCÊS* 🏳️‍🌈
━━━━━━━ 💖 ━━━━━━━

👨‍❤️‍👨 *Novo Casal Gay Formado:*

        @${p1.split('@')[0]}
                 🏳️‍🌈
        @${p2.split('@')[0]}

━━━━━━━ ✨ ━━━━━━━

_${mensagemSortida}_
`.trim()

        await conn.sendMessage(m.chat, { 
            text: mensagem, 
            mentions: [p1, p2] 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('🌈 Não foi possível sortear o casal no momento... tente novamente.')
    }
}

handler.help = ['casalgay']
handler.tags = ['relacionamento']
handler.command = ['casalgay', 'casal-gay', 'gaycasal']
handler.register = false 

export default handler