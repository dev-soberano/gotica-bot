/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.modoreal) return m.reply('*O Modo Real está desativado.* 🍷')
    if (!chat.users) return m.reply('*Ninguém movimentou a economia deste grupo ainda.*')

    const users = Object.entries(chat.users).map(([jid, data]) => ({
        jid,
        total: (data.coin || 0) + (data.bank || 0)
    })).filter(u => u.total > 0)

    const sorted = users.sort((a, b) => b.total - a.total)

    const iconos = ['🥇', '🥈', '🥉']
    let texto = `╭─〔 🏆 *RANKING DE MILIONÁRIOS* 〕\n│\n`

    for (let i = 0; i < Math.min(10, sorted.length); i++) {
        const { jid, total } = sorted[i]
        
        // Busca o nome na DB global de usuários primeiro
        let nameInDb = global.db.data.users[jid]?.name
        let nome = nameInDb || conn.getName(jid)

        // Se o nome ainda for o número ou conter caracteres de JID, limpamos
        if (!nome || nome.includes('@s.whatsapp.net') || /^\+?[0-9\s\-]+$/.test(nome)) {
            // Se for número, tenta deixar só o apelido ou parte do número para não ficar feio
            nome = nameInDb || `Magnata #${jid.split('@')[0].slice(-4)}`
        }
        
        const icono = iconos[i] || '✨'
        const formatado = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

        texto += `│ ${icono} ${i + 1}º » *${nome}*\n`
        texto += `│ 💰 Fortuna: *${formatado}*\n│\n`
    }

    texto += `╰─────────────────────\n> Estes são os mais influentes do grupo.`

    await conn.reply(m.chat, texto.trim(), m, {
        mentions: sorted.slice(0, 10).map(u => u.jid)
    })
}

handler.help = ['baltop', 'ranking', 'ricos']
handler.tags = ['economia']
handler.command = ['baltop', 'ranking', 'ricos']
handler.group = true

export default handler