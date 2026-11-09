/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  const metadata = await conn.groupMetadata(m.chat).catch(_ => null) || {};
  const groupName = metadata.subject || 'este Grupo';

  const status = (option) => option ? '✅' : '❌';

  const primaryBot = chat.botPrimario ? `@${chat.botPrimario.split('@')[0]}` : 'Não definido';

  const avatar = "https://files.catbox.moe/agyn6l.jpeg";

  const text = `╭━━━[ *CONFIGURAÇÃO* ]━━━⬣
┃
┃ ⭐ Grupo: *${groupName}*
┃ 🤖 Bot Primário: *Gotica bot*
┃
┠───═[ *SEGURANÇA* ]═───⬣
┃
┃ ${status(chat.antiLink)} ◈ Anti-Link
┃ ${status(chat.antiLink2)} ◈ Anti-Link 2
┃ ${status(chat.antiBot)} ◈ Anti-Bot
┃ ${status(chat.antiBot2)} ◈ Anti-Subbots
┃ ${status(chat.antitoxic)} ◈ Anti-Tóxico
┃ ${status(chat.antitraba)} ◈ Anti-Trava
┃ ${status(chat.antifake)} ◈ Anti-Fake
┃
┠───═[ *AUTOMAÇÃO* ]═───⬣
┃
┃ ${status(chat.welcome)} ◈ Boas-vindas
┃ ${status(chat.detect)} ◈ Detecção
┃ ${status(chat.autolevelup)} ◈ Level Up Auto
┃ ${status(chat.autoresponder)} ◈ Auto-Resposta
┃ ${status(chat.reaction)} ◈ Reações
┃
┠───═[ *GESTÃO E CONTEÚDO* ]═───⬣
┃
┃ ${status(chat.modoadmin)} ◈ Apenas Admins
┃ ${status(chat.autoAceptar)} ◈ Auto-Aceitar
┃ ${status(chat.autoRechazar)} ◈ Auto-Rejeitar
┃ ${status(chat.nsfw)} ◈ Conteúdo +18
┃
╰━━━━━━━━━━━━━━━━━━⬣

> *Ative ou desative uma opção usando, por exemplo: #antilink*`.trim();

  await m.react("⚙️");
  
  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: chat.botPrimario ? [chat.botPrimario] : [],
      externalAdReply: {
        title: `❖ ${groupName} ❖`,
        body: '💋 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲̧𝙰̃𝙾 𝙳𝙾 𝙶𝚁𝚄𝙿𝙾',
        thumbnailUrl: avatar,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['configuracao'];
handler.tags = ['admin'];
handler.command = ['config', 'configuracao', 'opcoes', 'configurar'];
handler.register = false;
handler.group = true;

export default handler;