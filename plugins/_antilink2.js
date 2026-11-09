/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/]*)?)\b/i

export async function before(m, { isAdmin, isBotAdmin }) {
  // IGNORA IMEDIATAMENTE SE NÃO HOUVER MENSAGEM OU TEXTO (Eventos de Entrada/Saída)
  if (!m || !m.text || typeof m.text !== 'string') return !0;
  if (m.isBaileys && m.fromMe) return !0;
  if (!m.isGroup) return !0;

  const chat = global.db.data?.chats?.[m.chat] || {};
  const delet = m.key?.participant || m.sender;
  const bang = m.key?.id;
  const botJid = this?.user?.jid || this?.user?.id;
  const bot = (botJid && global.db.data?.settings?.[botJid]) || {};
  const senderClean = m.sender ? String(m.sender).split('@')[0] : '';
  const user = `@${senderClean}`;
  const isGroupLink = linkRegex.exec(m.text);

  // SÓ EXECUTA SE FOR EXPLICITAMENTE TRUE
  if (chat.antiLink2 === true && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat).catch(() => '')}`
      const linkThisGroup2 = `https://www.youtube.com/`;
      const linkThisGroup3 = `https://youtu.be/`;
      
      // EXCEÇÕES: O bot ignora se for link do próprio grupo ou YouTube
      if (linkThisGroup && m.text.includes(linkThisGroup)) return !0;
      if (m.text.includes(linkThisGroup2)) return !0;
      if (m.text.includes(linkThisGroup3)) return !0;
    }

    // Mensagem de Deboche
    await this.sendMessage(m.chat, {
      text: `*「 ⚠️ ANTI-LINKS 2.0 」*\n\nNão aprendem nunca, né? 🙄 ${user} você achou que eu estava dormindo? Link externo não entra no meu reino. Tchau! 💀`, 
      mentions: [m.sender]
    }, { quoted: m });

    if (!isBotAdmin) return m.reply(`✦ Eu peguei o infrator, mas não sou Admin para dar o chute final.`);

    // Verifica a configuração de restrição do Owner
    if (isBotAdmin && bot.restrict) {
      await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      const responseb = await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0]?.status === '404') return;
    } else if (!bot.restrict) {
        return m.reply(`✦ O AntiLink2 detectou o link, mas a opção de **RESTRICT** está desligada nas minhas configurações globais.`);
    }
  }
  return !0;
}