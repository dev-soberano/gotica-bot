/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix }) => {
    // Verifica se o modo NSFW está ativo no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(`*⚠️ O conteúdo NSFW está desativado neste grupo.*`);
    }
    
    let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
    
    if (!user) return m.reply(`*⚠️ Marque alguém ou responda a uma mensagem para penetrar!*`);

    let nomeAlvo = conn.getName(user);
    let nomeAutor = conn.getName(m.sender);
    m.react('🔥');

    const responseMessage = `
*${nomeAutor} ENCHEU A CARA DE ${nomeAlvo} DE LEITE!* 🔥💦

*Colocou tudo dentro de* *${nomeAlvo}* *com força até ficar seco, enquanto ouvia: "por favor mais forteeee, ahhhhhhh, me faz um filho!" e no fim deixou a pessoa de cadeira de rodas de tanto macetar!*

*${nomeAlvo}* 
✿ *VOCÊ FOI PENETRADO(A)!*`;

    // Envio direto da frase com menção
    await conn.sendMessage(m.chat, { 
        text: responseMessage, 
        mentions: [user, m.sender] 
    }, { quoted: m });
}

handler.help = ['penetrar @tag'];
handler.tags = ['nsfw'];
handler.command = ['penetrar', 'penetrado'];
handler.group = true;

export default handler;