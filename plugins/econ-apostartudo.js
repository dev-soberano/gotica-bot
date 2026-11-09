/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {}

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para essa loucura!* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0 }
    
    let userGroup = chat.users[m.sender]
    let saldoAtual = userGroup.coin

    if (saldoAtual <= 0) return m.reply('*Você não tem nem um centavo na carteira para apostar, pobre!* 😂')

    // Sistema de Cooldown (30 segundos para evitar spam de risco)
    let tiempoEspera = 30
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
        let restan = Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000)
        return m.reply(`🎰 *Calma, viciado!* O coração precisa aguentar. Espere *${restan} segundos*.`)
    }

    cooldowns[m.sender] = Date.now()

    // Lógica 50/50
    let vitoria = Math.random() < 0.5
    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    if (vitoria) {
        let ganho = saldoAtual * 2
        userGroup.coin = ganho
        await m.react('🤑')
        let msgVitoria = `
┏━⏤͟͟͞͞★꙲⃝͟💎 *VITÓRIA TOTAL*
┃
┃ 🎉 *QUE SORTE, ${m.pushName.toUpperCase()}!*
┃ 💰 *Você dobrou tudo:* ${formatar(ganho)}
┃ 📈 *Resultado:* Rico e Soberano!
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟✨❈┉━━━━┛`.trim()
        conn.reply(m.chat, msgVitoria, m)
    } else {
        userGroup.coin = 0
        await m.react('🤡')
        let msgDerrota = `
┏━⏤͟͟͞͞★꙲⃝͟💀 *DERROTA TOTAL*
┃
┃ 😭 *SINTO MUITO,...*
┃ 💸 *Você perdeu:* ${formatar(saldoAtual)}
┃ 📉 *Resultado:* Carteira zerada! 
┃ 🏦 *Sorte que o Banco tá salvo.*
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟👣❈┉━━━━┛`.trim()
        conn.reply(m.chat, msgDerrota, m)
    }
}

handler.help = ['apostartudo']
handler.tags = ['economia']
handler.command = ['apostartudo', 'allin']
handler.group = true

export default handler