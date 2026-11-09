/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para acessar a loja.* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0, health: 100 }
    
    let user = chat.users[m.sender]
    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    // Itens disponíveis na loja
    const itens = {
        '1': { nome: 'Curativo 🩹', preco: 50, descricao: 'Recupera 20 de vida' },
        '2': { nome: 'Kit Médico 💉', preco: 150, descricao: 'Recupera 100 de vida' },
        '3': { nome: 'Passaporte Falso 🎫', preco: 500, descricao: 'Reduz risco de ser preso no tráfico' }
    }

    if (!text) {
        let menuLoja = `┏━━⏤͟͟͞͞★꙲⃝͟🛒 *LOJA DO GRUPO*\n┃\n`
        for (let key in itens) {
            menuLoja += `┃ *${key}* - ${itens[key].nome}\n┃ 💰 Preço: ${formatar(itens[key].preco)}\n┃ 📝 ${itens[key].descricao}\n┃\n`
        }
        menuLoja += `┗━━━━━⏤͟͟͞͞★꙲⃝͟💎❈┉━━━━┛\n\n`
        menuLoja += `> Digite *${usedPrefix}comprar [número]* para comprar.`
        return m.reply(menuLoja)
    }

    let itemSelecao = itens[text.trim()]
    if (!itemSelecao) return m.reply('*Item inválido! Escolha um número da lista.*')

    if (user.coin < itemSelecao.preco) {
        return m.reply(`❌ *Saldo insuficiente!* Você precisa de ${formatar(itemSelecao.preco)}.`)
    }

    // Processa a compra
    user.coin -= itemSelecao.preco
    
    // Lógica simples de efeito (exemplo para curativos)
    if (text === '1') user.health = Math.min(100, (user.health || 0) + 20)
    if (text === '2') user.health = 100
    // O item 3 (Passaporte) você pode usar como check no comando de traficar depois

    m.reply(`✅ *Compra realizada!*\n\n🎁 *Item:* ${itemSelecao.nome}\n💸 *Pago:* ${formatar(itemSelecao.preco)}\n💰 *Saldo Atual:* ${formatar(user.coin)}`)
}

handler.help = ['loja']
handler.tags = ['economia']
handler.command = ['loja', 'shop', 'comprar']
handler.group = true

export default handler