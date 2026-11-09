/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, participants }) => {
    let chat = global.db.data.chats[m.chat]
    
    if (!chat.modoreal) {
        return m.reply(`*O Modo Real (Economia) está desativado neste grupo, Soberano.* 🍷\n\n*Peça para um ADM ativar usando:* ${usedPrefix}modoreal on`)
    }

    // Inicializa o objeto de usuários do grupo se não existir
    if (!chat.users) chat.users = {}

    let who = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
        ? m.quoted.sender 
        : m.sender

    if (who == conn.user.jid) return m.react('✖️')

    let primaryJid = who; 
    if (who.endsWith('@lid') && m.isGroup) {
        const participantInfo = participants.find(p => p.lid === who);
        if (participantInfo && participantInfo.id) { 
            primaryJid = participantInfo.id;
        }
    }

    // Inicialização da carteira LOCAL do grupo
    if (!chat.users[primaryJid]) {
        chat.users[primaryJid] = {
            coin: 0,
            bank: 0,
            lastworking: 0,
            lasttrafico: 0
        }
    }

    let userGroup = chat.users[primaryJid] 
    let nombre = await conn.getName(primaryJid) 

    const formatar = (valor) => {
        return (valor || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    }

    let coin = userGroup.coin || 0
    let bank = userGroup.bank || 0
    let total = coin + bank

    // Lógica de frases baseada nas Patentes
    let statusMsg = ""
    if (total < 5000) statusMsg = "Você ainda é um Pobre, trabalhe para subir na vida."
    else if (total < 50000) statusMsg = "Você já é Rico, mas pode conquistar muito mais."
    else if (total < 500000) statusMsg = "Status: Milionário. Sua presença impõe respeito."
    else if (total < 5000000) statusMsg = "Status: Bilionário. O mundo está aos seus pés."
    else statusMsg = "Magnata Supremo! Você atingiu o topo da hierarquia."

    const dicas = [
        `Use *${usedPrefix}trabalhar* para ganhar dinheiro de forma honesta.`,
        `O crime compensa? Use *${usedPrefix}traficar* para descobrir os riscos.`,
        `Está com sorte? Tente a sorte usando *${usedPrefix}apostar* [valor].`,
        `Peça para aquele seu amigo rico te fazer um *${usedPrefix}pix* [valor] [@tag].`,
        `Use *${usedPrefix}depositar* para proteger sua grana de assaltos e sequestros.`,
        `Confira seu cargo no governo usando *${usedPrefix}level*.`
    ]
    const dicaAleatoria = dicas[Math.floor(Math.random() * dicas.length)]

    let texto = `
╭─〔 ᥫ᭡ 𝙀𝙓𝙏𝙍𝘼𝙏𝙊 𝙁𝙄𝙉𝘼𝙉𝘾𝙀𝙄𝙍𝙊 🍷 〕
│ 👤 *Usuário:* ${nombre}
│ 💸 *Na Carteira:* ${formatar(coin)}
│ 🏦 *No Banco:* ${formatar(bank)}
│ 🧾 *Total:* ${formatar(total)}
╰─────────────────────
> ${statusMsg} 

📌 *Dica:* ${dicaAleatoria}`.trim()

    await conn.reply(m.chat, texto, m)
}

handler.help = ['saldo', 'bank']
handler.tags = ['economia']
handler.command = ['bal', 'balance', 'bank', 'saldo', 'carteira', 'banco']
handler.register = false 
handler.group = true

export default handler