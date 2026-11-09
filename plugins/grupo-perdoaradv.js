/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, {conn, text, command, usedPrefix, isOwner}) => {
  // Se for o Soberano, ele ignora qualquer verificação de admin abaixo
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  else who = m.chat;

  const user = global.db.data.users[who];
  
  const warntext = `✨ *Hey!* Marque um usuário para perdoar a advertência. 💋\n\n⭐ *Exemplo:* *${usedPrefix + command} @user*`;
  
  if (!who || !who.includes('@s.whatsapp.net')) return m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)});
  
  if (!user || user.warn <= 0) {
    return m.reply(`🌙 *O usuário já está limpo e possui 0 advertências.* 🖤`);
  }
  
  // Remove 1 advertência
  user.warn -= 1;
  
  await m.react("✨");
  
  await conn.reply(m.chat, `✨ *Advertência perdoada!* 💋\n\n⭐ *Usuário:* @${who.split`@`[0]}\n💫 *Avisos Atuais:* ${user.warn}/3`, m, {mentions: [who]});
};

handler.help = ['perdoar @user'];
handler.tags = ['admin'];
handler.command = ['delwarn', 'unwarn', 'perdoar', 'removeraviso']; 
handler.group = true;
// A trava abaixo só vai valer para os outros, pois o código acima já aceita o isOwner
handler.admin = true; 
handler.botAdmin = true;
handler.register = false; 

export default handler;