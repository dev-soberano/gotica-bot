/**
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado.* 🍷')

    if (!text) return m.reply(`*Digite o código para resgatar.*\nExemplo: ${usedPrefix + command} PIX100`)

    let codigoReq = text.trim().toUpperCase()
    if (!global.db.data.codes || !global.db.data.codes[codigoReq]) {
        return m.reply('*Código inválido ou já resgatado por outra pessoa!* ❌')
    }

    let codeData = global.db.data.codes[codigoReq]

    // Inicializa o usuário no grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0 }

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    // Entrega a recompensa
    chat.users[m.sender].coin += codeData.coin
    
    m.reply(`🎉 *RESGATE CONCLUÍDO!*\n\nVocê foi o mais rápido e ganhou *${formatar(codeData.coin)}*!`)

    // Deleta o código para ninguém mais usar
    delete global.db.data.codes[codigoReq]
}

handler.command = ['resgatar', 'redeem', 'claim']
handler.group = true

export default handler