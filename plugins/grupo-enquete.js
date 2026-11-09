/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    // Verificação simples sem disparar o erro do handler.js
    if (!text || !text.includes('|')) {
        let instrucao = `✨ *Formato incorreto!*\n\n📌 Exemplo:\n*${usedPrefix + command}* Pergunta|Opção1|Opção2`
        return conn.reply(m.chat, instrucao, m)
    }
    
    let b = text.split('|')
    if (b.length < 2) return conn.reply(m.chat, `✨ *A enquete precisa de pelo menos uma pergunta e uma opção.*`, m)
    
    let titulo = b[0].trim()
    let opcoes = b.slice(1).map(v => v.trim()).filter(v => v.length > 0)
    
    if (opcoes.length < 1) return conn.reply(m.chat, `✨ *Insira opções válidas para votar.*`, m)

    try {
        await conn.sendPoll(m.chat, titulo, opcoes, m)
    } catch (e) {
        console.error(e)
        return conn.reply(m.chat, `❌ *Erro ao criar enquete.*`, m)
    }
}

handler.help = ['enquete <pergunta|opção1|opção2>']
handler.tags = ['grupo'] 
handler.command = ['poll', 'enquete', 'votar'] 
handler.group = true

export default handler