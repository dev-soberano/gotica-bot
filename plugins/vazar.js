/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║    ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

let handler = async (m, { conn, isOwner }) => {
    // 1. Verificação de soberania (Só você pode se banir)
    if (!isOwner) return m.reply('❌ *Acesso negado!* Somente o meu mestre Soberano pode solicitar o próprio banimento. 💔')

    // 2. Mensagem de despedida dramática
    await m.reply('🖤 *Que pena mestre... mas seu pedido é uma ordem!*')
    
    // 3. Pequeno delay para a mensagem ser lida
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 4. O banimento real (Auto-ban do Soberano)
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    
    // 5. Reação final
    await m.react("🫡")
}

// Para que serve: O bot bane o próprio dono (você) do grupo após uma despedida.
// Como usar: Digite .vazar ou .sairnoban
// Público: Exclusivo para o Soberano (Dono).

handler.help = ['vazar']
handler.tags = ['soberano']
handler.command = ['vazar', 'sairnoban', 'mestre']
handler.group = true
handler.botAdmin = true

export default handler