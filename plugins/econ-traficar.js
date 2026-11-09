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
    
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado.* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, lasttrafico: 0 }
    
    let userGroup = chat.users[m.sender]
    let cooldown = 120000 

    if (new Date - (userGroup.lasttrafico || 0) < cooldown) {
        let resto = Math.ceil(((userGroup.lasttrafico + cooldown) - new Date()) / 1000)
        return m.reply(`⏳ *A polícia está na cola!* Aguarde ${resto}s.`)
    }

    const mercadorias = [
        { item: "Skittles Estragados 🍬", ganho: [30, 80] },
        { item: "Fotos do pé do Soberano 👣", ganho: [150, 300] },
        { item: "Dados Vazados 🖥️", ganho: [50, 150] },
        { item: "Gasolina Adulterada ⛽", ganho: [40, 100] },
        { item: "Ervas Suspeitas 🌿", ganho: [60, 140] },
        { item: "Cópias Piratas 🎮", ganho: [100, 150] },
        { item: "Fios de Cobre ⚡", ganho: [50, 120] },
        { item: "Muamba do Paraguai 📦", ganho: [80, 130] },
        { item: "Diplomas por E-mail 🎓", ganho: [120, 150] },
        { item: "Escravo de Fuga do Soberano ⛓️", ganho: [500, 1000] }
    ]

    let rodou = Math.random() < 0.2
    let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    if (rodou) {
        let multa = Math.floor(Math.random() * 50) + 20
        userGroup.coin = Math.max(0, (userGroup.coin || 0) - multa)
        userGroup.lasttrafico = new Date * 1
        return m.reply(`🚨 *RODOU!* Pagou ${formatarReal(multa)} de suborno.`)
    }

    const carga = mercadorias[Math.floor(Math.random() * mercadorias.length)]
    let ganhoRaw = Math.floor(Math.random() * (carga.ganho[1] - carga.ganho[0] + 1)) + carga.ganho[0]
    
    userGroup.coin = (userGroup.coin || 0) + ganhoRaw
    userGroup.lasttrafico = new Date * 1

    let mensagem = `
╭─〔 🔫 *TRÁFICO LOCAL* 🏙️ 〕
│
│ 👤 *Criminoso:* ${m.pushName}
│ 📦 *Carga:* ${carga.item}
│ 💸 *Lucro:* ${formatarReal(ganhoRaw)}
╰─────────────────────
│ 💰 *Saldo:* ${formatarReal(userGroup.coin)}
╰─────────────────────`.trim()

    // Lógica de menção: Só marca se a carga envolver o Soberano
    if (carga.item.includes('Soberano')) {
        await conn.reply(m.chat, mensagem, m, { mentions: ['556391330669@s.whatsapp.net'] })
    } else {
        await conn.reply(m.chat, mensagem, m)
    }
}

handler.help = ['traficar']
handler.tags = ['rpg']
handler.command = ['traficar', 'vender', 'crime']
handler.group = true

export default handler