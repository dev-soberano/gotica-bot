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
    
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para você poder trabalhar.* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, lastworking: 0 }
    
    let userGroup = chat.users[m.sender]
    let cooldown = 60000 

    if (new Date - (userGroup.lastworking || 0) < cooldown) {
        let resto = Math.ceil(((userGroup.lastworking + cooldown) - new Date()) / 1000)
        return m.reply(`⏳ *Calma lá!* Descanse um pouco e volte em *${resto} segundos*.`)
    }

    const trabalhos = [
        { cargo: "Garota(o) do Job 👠", ganho: [100, 500] },
        { cargo: "Faxineira(o) de Hospital 🏥", ganho: [50, 120] },
        { cargo: "Especialista em assistir TV 📺", ganho: [20, 50] },
        { cargo: "Sereia Profissional 🧜‍♀️", ganho: [150, 400] },
        { cargo: "Testador de Toboágua 🌊", ganho: [80, 200] },
        { cargo: "Consertador de Bichos de Pelúcia 🧸", ganho: [30, 90] },
        { cargo: "Degustador de Ração Animal 🐶", ganho: [40, 110] },
        { cargo: "Espanador de Esqueleto de Dinossauro 🦖", ganho: [70, 180] },
        { cargo: "Luto de Aluguel ⚰️", ganho: [100, 300] },
        { cargo: "Especialista em Tecidos de Papel 🧻", ganho: [20, 60] },
        { cargo: "Programador de Bot 🤖", ganho: [50, 150] },
        { cargo: "Segurança do Soberano 🛡️", ganho: [200, 400] },
        { cargo: "Investidor de Cripto 📉", ganho: [-100, 600] },
        { cargo: "Vendedor de Picolé 🌵", ganho: [10, 100] },
        { cargo: "Escravo(a) do @556391330669 ⛓️", ganho: [5000, 15000] }
    ]

    const trampo = trabalhos[Math.floor(Math.random() * trabalhos.length)]
    let ganhoRaw = Math.floor(Math.random() * (trampo.ganho[1] - trampo.ganho[0] + 1)) + trampo.ganho[0]
    
    userGroup.coin = (userGroup.coin || 0) + ganhoRaw
    if (userGroup.coin < 0) userGroup.coin = 0 
    userGroup.lastworking = new Date * 1

    let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let mensagem = `
╭─〔 👷 *TRABALHO LOCAL* 🏛️ 〕
│
│ 👤 *Trabalhador:* ${m.pushName}
│ 🛠️ *Serviço:* ${trampo.cargo}
│ 💸 *Recebido:* ${formatarReal(ganhoRaw)}
╰─────────────────────
│ 💰 *Saldo:* ${formatarReal(userGroup.coin)}
╰─────────────────────
> _Economia isolada para este chat._`.trim()

    // Lógica de menção: Só marca se for o cargo de escravo
    if (trampo.cargo.includes('Escravo(a) do Soberano')) {
        await conn.reply(m.chat, mensagem, m, { mentions: ['556391330669@s.whatsapp.net'] })
    } else {
        await conn.reply(m.chat, mensagem, m)
    }
}

handler.help = ['trabalhar']
handler.tags = ['rpg']
handler.command = ['trabalhar', 'trampar', 'trabaia', 'work']
handler.group = true

export default handler