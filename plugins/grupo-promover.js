/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, text, participants }) => {
  let user;

  // Obter o usuário a promover
  if (m.mentionedJid && m.mentionedJid.length) {
    user = m.mentionedJid[0]; // usa o primeiro mencionado
  } else if (m.quoted?.sender) {
    user = m.quoted.sender;
  } else {
    throw '*⚠️ Você deve mencionar um usuário ou responder à mensagem dele para promovê-lo.* 💋';
  }

  // Promover o usuário
  await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
  conn.reply(m.chat, `*✅ @${user.split('@')[0]} agora é administrador.* 💋`, m, {
    mentions: [user]
  });
};

handler.help = ['promover'];
handler.tags = ['grupo'];
handler.command = ['promote', 'promover', 'daradm'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;