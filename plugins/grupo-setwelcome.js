/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat];
  if (!chat) chat = global.db.data.chats[m.chat] = {};

  if (text) {
    chat.welcomeText = text;
    await m.react("👋");
    m.reply('✨ *A mensagem de boas-vindas foi configurada com sucesso neste grupo!* 💋');
  } else {
    let welcome = chat.welcomeText || 'Não há nenhuma mensagem configurada.';
    m.reply(`🌙 *A mensagem de boas-vindas atual deste grupo é:*\n\n*${welcome}*\n\n💫 *Para alterá-la, use:* \n*${usedPrefix + command} <texto>*\n\n🖤 *Você pode usar estas variáveis:* \n- *@user*: Menciona o novo membro.\n- *@subject*: Mostra o nome do grupo.\n- *@desc*: Mostra a descrição do grupo.`);
  }
};

handler.help = ['setwelcome <texto>'];
handler.tags = ['admin'];
handler.command = ['setwelcome', 'chegada', 'bemvindo','setchegada']; // Handlers em português
handler.admin = true;
handler.group = true;
handler.register = false; 

export default handler;