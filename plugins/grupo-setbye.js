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
    chat.byeText = text;
    await m.react("👋");
    m.reply('✨ *A mensagem de despedida foi configurada com sucesso neste grupo!* 💋');
  } else {
    let bye = chat.byeText || 'Não há nenhuma mensagem configurada.';
    m.reply(`🌙 *A mensagem de despedida atual deste grupo é:*\n\n*${bye}*\n\n💫 *Para alterá-la, use:* \n*${usedPrefix + command} <texto>*\n\n🖤 *Você pode usar estas variáveis:* \n- *@user*: Menciona o membro que saiu.\n- *@subject*: Mostra o nome do grupo.`);
  }
};

handler.help = ['setbye <texto>'];
handler.tags = ['admin'];
handler.command = ['setbye', 'setadeus', 'saida']; // Handlers em português
handler.admin = true;
handler.group = true;
handler.register = false; 

export default handler;