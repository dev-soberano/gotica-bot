/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, command }) => {
    // Define o ID do grupo (o atual ou um ID específico passado no texto)
    let id = text ? text : m.chat  
    
    // Desativa o welcome temporariamente para não bugar ao sair
    let chat = global.db.data.chats[id]
    if (chat) chat.welcome = false

    // Despedida do bot
    await conn.reply(id, '*🏰 O Soberano ordenou e eu estou de partida! Adeus a todos! (≧ω≦)ゞ*') 
    
    // Comando para o bot sair do grupo
    await conn.groupLeave(id)

    try {  
        if (chat) chat.welcome = true
    } catch (e) {
        console.log(e)
    }
}

handler.help = ['sair']
handler.tags = ['owner']
handler.command = ['sair', 'leavegc', 'salirdelgrupo', 'leave']
handler.group = true
handler.rowner = true // Comando exclusivo para você (Soberano)

export default handler