/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, isROwner }) => {
    if (!isROwner) return 

    let chat = global.db.data.chats[m.chat];
    const botJid = conn.user.jid;

    if (!chat.bannedBots) chat.bannedBots = [];
    
    if (!chat.bannedBots.includes(botJid)) {
        return m.reply('✨ *Soberano,* eu já estou ativa e pronta para servir neste chat. 💋');
    }

    chat.bannedBots = chat.bannedBots.filter(jid => jid !== botJid);

    await m.react("🔓");
    m.reply(`✅ *Bot Ativado* ⭐\n\nMinhas funções foram restauradas neste grupo por sua ordem! 💋`);
};

handler.help = ['on'];
handler.tags = ['owner'];
handler.command = ['on', 'onbot', 'ativarbot']; 
handler.group = true;
handler.register = false; 

export default handler;