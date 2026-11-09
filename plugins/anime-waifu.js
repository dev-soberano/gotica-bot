/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Configurações de contexto corrigidas para evitar erros de variáveis não definidas
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363405588045392@newsletter',
        newsletterName: '🌸 Gotica Bot - Waifus 🌸',
        serverMessageId: -1
      },
      externalAdReply: {
        title: 'Gótica Bot - Sistema de Waifus',
        body: 'Criado por: Leandro',
        // Removido 'icons' e 'packname' que causavam erro, usando strings fixas
        thumbnailUrl: 'https://files.catbox.moe/6bnlqe.mp4', 
        sourceUrl: 'https://chat.whatsapp.com/HhIATn48XsuAbduwn8sowT',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    await m.react('🌸');
    
    // Removido contextInfo daqui para garantir que a mensagem de espera saia rápido e sem erro
    await conn.reply(m.chat, '*🎀 Buscando uma waifu para você... aguarde um momento~*', m);

    let res = await fetch('https://api.waifu.pics/sfw/waifu');
    if (!res.ok) throw new Error('Não foi possível obter a waifu.');
    
    let json = await res.json();
    if (!json.url) throw new Error('Resposta inválida da API.');

    const caption = `🌸 *Aqui está sua waifu, ${conn.getName(m.sender)}-kun~* 〰️\n\n✨ Gostou dela? Use o comando novamente para ver outra!`;

    // Enviando a imagem da waifu com os metadados corrigidos
    await conn.sendMessage(
      m.chat,
      {
        image: { url: json.url },
        caption,
        footer: '🐾 Gotica Bot - Leandro',
        contextInfo
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '❌ Desculpe, ocorreu um erro ao buscar sua waifu.', m);
  }
};

handler.help = ['waifu'];
handler.tags = ['anime'];
handler.command = ['waifu','esposa'];
handler.group = true;

// Sem trava de registro
handler.register = false;

// Cooldown zero para o soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Gera uma imagem aleatória de uma Waifu (personagem feminina de anime).
// Como usar: Basta digitar .waifu no grupo.
// Acesso: Todos os membros.

export default handler;