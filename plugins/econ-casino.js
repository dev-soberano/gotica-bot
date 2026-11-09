/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║    ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

let cooldowns = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para apostar no casino.* 🍷')

    // Inicializa o usuário no grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0 }
    
    let userGroup = chat.users[m.sender]
    let botname = 'Gótica Bot'
    
    // Proteção contra nome nulo para não dar erro de toUpperCase/String
    let username = (m.pushName || 'Visitante').toUpperCase()
    
    // --- SISTEMA DE COOLDOWN PERSONALIZADO ---
    let ownerId = '5584921621075' // Seu ID (Soberano)
    let isOwner = m.sender.split`@` [0] === ownerId || m.fromMe
    let tiempoEspera = 15
    
    // Se NÃO for o Soberano, verifica o cooldown
    if (!isOwner) {
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
            let restan = Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000)
            return m.reply(`🎰 *CALMA LÁ!* Você já apostou recentemente. Espere *${restan} segundos* para tentar a sorte de novo.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (args.length < 1) return m.reply(`💰 *Quanto deseja apostar?*\n\nExemplo:\n> *${usedPrefix + command} 100*`)

    let count = args[0]
    count = /all/i.test(count) ? userGroup.coin : parseInt(count)
    count = Math.max(1, count)

    if (isNaN(count)) return m.reply('*Por favor, insira um número válido para apostar.* ❌')

    if (userGroup.coin < count) {
        return m.reply(`❌ *SALDO INSUFICIENTE!* Você não tem saldo suficiente para apostar essa quantia.`)
    }
    
    // Lógica do Jogo
    let Aku = Math.floor(Math.random() * 101) // Número do Bot
    let Kamu = Math.floor(Math.random() * 95) // Número do Usuário (Bot tem vantagem leve)

    userGroup.coin -= count

    let resultado = `🎰 *CASINO - ${botname}* 🎰\n\n`
    resultado += `➠ *BOT* tirou: *${Aku}*\n`
    resultado += `➠ *${username}* tirou: *${Kamu}*\n\n`

    if (Aku > Kamu) {
        resultado += `> 💀 *PERDEU!* Você perdeu *${formatar(count)}*. Mais sorte na próxima vez.`
    } else if (Aku < Kamu) {
        let premio = count * 2
        userGroup.coin += premio
        resultado += `> 🎉 *GANHOU!* Parabéns! Você faturou *${formatar(premio)}*!`
    } else {
        userGroup.coin += count
        resultado += `> 🤝 *EMPATE!* Seus *${formatar(count)}* foram devolvidos.`
    }

    await m.react('🎲')
    conn.reply(m.chat, resultado.trim(), m)
}

// Para que serve: Jogo de apostas onde você pode dobrar ou perder suas moedas do grupo.
// Como usar: .apostar <valor> ou .apostar all
// Público: Comando para Membros (Soberano não tem cooldown).

handler.help = ['apostar <quantia>']
handler.tags = ['economia']
handler.command = ['apostar', 'casino']
handler.group = true

export default handler

function formatar(v) {
    return v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}