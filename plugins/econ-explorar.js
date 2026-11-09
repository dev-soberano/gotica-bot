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
    if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para explorar.* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0, lastExplorar: 0, health: 100, exp: 0 }
    
    let userGroup = chat.users[m.sender]
    if (userGroup.health === undefined) userGroup.health = 100
    
    let img = 'https://files.catbox.moe/357gtl.jpg'

    if (userGroup.health < 20) {
        return m.reply(`💔 *Você está exausto demais!* \nSaúde: *${userGroup.health}%*. Use *.curar* antes de voltar ao bosque.`)
    }

    let cooldown = 300000 // 5 minutos
    if (new Date - (userGroup.lastExplorar || 0) < cooldown) {
        let timeLeft = (userGroup.lastExplorar + cooldown) - new Date()
        return m.reply(`⏳ *Aguarde!* O bosque é perigoso. Espere *${msToTime(timeLeft)}*.`)
    }

    const eventos = [
        { nome: '🌲 Tesouro sob a Árvore Sagrada', coin: 1500, exp: 120, health: 0, msg: 'Você descobriu um cofre antigo cheio de moedas!' },
        { nome: '🐺 Ataque de Lobos Famintos', coin: -800, exp: 40, health: -25, msg: 'Você foi atacado por uma alcateia e perdeu dinheiro na fuga!' },
        { nome: '🔮 Encontro com uma Feiticeira', coin: 800, exp: 60, health: 10, msg: 'Uma feiticeira te abençoou com riquezas e vitalidade.' },
        { nome: '☠️ Armadilha de Duendes', coin: -1200, exp: 20, health: -30, msg: 'Caiu em uma armadilha e perdeu parte do seu botim.' },
        { nome: '🏹 Caçador Errante', coin: 600, exp: 50, health: 0, msg: 'Um caçador te deu provisões por ajudá-lo na caça.' },
        { nome: '💎 Pedra Épica da Alma', coin: 3000, exp: 150, health: 0, msg: 'Uma pedra mágica explodiu em riqueza pura!' },
        { nome: '🦴 Ossos Mágicos', coin: 400, exp: 40, health: 5, msg: 'Ossos antigos brilharam e te deram sorte.' },
        { nome: '🕳️ Fosso sem Fundo', coin: -1000, exp: 0, health: -40, msg: 'Você escorregou e caiu, perdendo boa parte do que carregava.' },
        { nome: '🌿 Curandeira do Bosque', coin: 0, exp: 60, health: 30, msg: 'Uma mulher misteriosa curou suas feridas com magia natural.' },
        { nome: '🪙 Mercador Ambulante', coin: 1000, exp: 70, health: 0, msg: 'Vendeu itens coletados e ganhou boas moedas.' },
        { nome: '🧌 Troll da Ponte', coin: -600, exp: 20, health: -15, msg: 'O troll te cobrou pedágio... na base da porrada.' },
        { nome: '🐾 Mascote Selvagem', coin: 300, exp: 40, health: 10, msg: 'Adotou uma criatura que te recompensou com moedas.' },
        { nome: '🗺️ Mapa de Explorador Perdido', coin: 1700, exp: 90, health: 0, msg: 'Achou um mapa secreto que levou a uma recompensa.' },
        { nome: '🦉 Coruja Mensageira', coin: 0, exp: 30, health: 0, msg: 'Recebeu notícias, mas nada de valor financeiro.' },
        { nome: '⚡ Árvore Maldita', coin: -500, exp: 10, health: -20, msg: 'Um raio te atingiu por chegar perto de uma árvore estranha.' },
        { nome: '🧝 Fada Curiosa', coin: 450, exp: 50, health: 15, msg: 'Uma fada te abençoou por sua gentileza.' },
        { nome: '🪓 Lenhador Misterioso', coin: 700, exp: 45, health: 0, msg: 'Cortou lenha com ele e recebeu um ótimo pagamento.' },
        { nome: '🪦 Cemitério Escondido', coin: -800, exp: 10, health: -25, msg: 'Profanou um local sagrado e sofreu as consequências.' },
        { nome: '🌀 Portal Dimensional', coin: 0, exp: 100, health: -10, msg: 'Entrou em outro mundo e voltou com sabedoria, mas fraco.' },
        { nome: '🐸 Sapo Falante', coin: 900, exp: 40, health: 10, msg: 'Resolveu o enigma do sapo e ganhou o tesouro dele.' }
    ]

    let ev = eventos[Math.floor(Math.random() * eventos.length)]

    userGroup.coin = Math.max(0, (userGroup.coin || 0) + ev.coin)
    userGroup.exp = (userGroup.exp || 0) + ev.exp
    userGroup.health = Math.min(100, Math.max(0, userGroup.health + ev.health))
    userGroup.lastExplorar = new Date * 1

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let info = `
〔 🌲 *EXPLORAÇÃO CONCLUÍDA* 〕
│
│ 📍 *Evento:* ${ev.nome}
│ 📝 *Resultado:* ${ev.msg}
│
│ 💸 *Dinheiro:* ${ev.coin >= 0 ? `+ ${formatar(ev.coin)}` : `- ${formatar(Math.abs(ev.coin))}`}
│ ✨ *XP Ganho:* +${ev.exp}
│ ❤️ *Saúde:* ${userGroup.health}%
╰─────────────────────
│ 💰 *Saldo Local:* ${formatar(userGroup.coin)}
╰─────────────────────`.trim()

    await conn.sendFile(m.chat, img, 'explorar.jpg', info, m)
}

handler.help = ['explorar']
handler.tags = ['economia']
handler.command = ['explorar', 'bosque']
handler.group = true

export default handler

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m e ${seconds}s`
}