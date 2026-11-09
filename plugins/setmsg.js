/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Inicialização forçada no banco de dados
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.msgs) global.db.data.msgs = {}
    
    let msgs = global.db.data.msgs
    
    if (!text) {
        let help = `*「 💡 COMO USAR O SETMSG 」*\n\n`
        help += `Você precisa dar um nome ao gatilho respondendo a uma mídia (áudio, foto, texto).\n\n`
        help += `*Exemplo:* \n`
        help += `1. Responda a um áudio com: *${usedPrefix + command} bomdia*\n`
        help += `2. Quando alguém digitar *bomdia*, eu enviarei o áudio!\n\n`
        help += `*Nota:* Use nomes simples e sem espaços.`
        return conn.reply(m.chat, help, m) // Usando return para parar o erro aqui
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // Salva a estrutura da mensagem
    msgs[text] = q.fakeObj ? q.fakeObj : JSON.parse(JSON.stringify(q))
    
    await conn.reply(m.chat, `*「 ✅ GATILHO CONFIGURADO 」*\n\nO nome *${text}* agora é uma resposta automática!\n\n*Dica:* Digite *${usedPrefix}listmsg* para ver todos os seus gatilhos.`, m)
}

handler.help = ['setmsg']
handler.tags = ['admin']
handler.command = ['setmsg', 'vmsg', 'addmsg']
handler.admin = true 

export default handler