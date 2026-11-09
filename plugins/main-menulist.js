/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Dev Soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { promises } from 'fs';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import moment from 'moment-timezone';

const cwd = process.cwd();
let cachedMedia = null;
let cachedMediaFailed = false; // evita tentar de novo indefinidamente na mesma execução

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout (${ms}ms) em: ${label}`)), ms)
    )
  ]);
}

// Nó binário que o WhatsApp exige pra renderizar botões nativos
// (nativeFlowMessage). A lib oficial @whiskeysockets/baileys não injeta
// isso sozinha — sem ele, o relayMessage completa sem erro mas o
// WhatsApp descarta a mensagem em silêncio.
function buildInteractiveNodes(chatId) {
  const nodes = [
    {
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [
            { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
          ]
        }
      ]
    }
  ];

  // Em chat privado (1:1), o WhatsApp também exige esse nó "bot"
  if (!chatId.endsWith('@g.us')) {
    nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
  }

  return nodes;
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  await m.react('⏳');

  try {
    let name = m.pushName || (await conn.getName(m.sender)) || m.sender.split('@')[0];
    let ucapanText = ucapan();

    cachedMedia = null;
    cachedMediaFailed = false;
    {
      console.log('[MENU] Preparando mídia do menu...');
      const gifVideosDir = path.join(cwd, 'src', 'menu');
      let randomVideo = null;
      if (fs.existsSync(gifVideosDir)) {
          const files = fs.readdirSync(gifVideosDir).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv'));
          if (files.length > 0) {
              randomVideo = path.join(gifVideosDir, files[Math.floor(Math.random() * files.length)]);
          }
      }

      try {
        cachedMedia = await withTimeout(
          prepareWAMessageMedia(
              { video: randomVideo ? fs.readFileSync(randomVideo) : { url: 'https://files.catbox.moe/yyk5xo.jpg' }, gifPlayback: true }, 
              { upload: conn.waUploadToServer }
          ),
          15000,
          'prepareWAMessageMedia (menu)'
        );
        console.log('[MENU] Mídia preparada com sucesso.');
      } catch (mediaErr) {
        console.error('[MENU] Falha ao preparar mídia, seguindo sem vídeo:', mediaErr.message);
        cachedMediaFailed = true;
        cachedMedia = null;
      }
    }

    let textoPrincipal = `🌙ᩚ⃟꙰⟡˖ *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐌𝐄𝐍𝐔𝐒* 🌙⃟✿˚\n\n`
    textoPrincipal += `𝙊𝙡𝙖́ *${name}* ${ucapanText}\n`
    textoPrincipal += `𝙈𝙚𝙪 𝙣𝙤𝙢𝙚 𝙚́ *𝙂𝙤́𝙩𝙞𝙘𝙖 𝘽𝙤𝙩*! 💋✨`

    const interactiveMessage = {
      header: cachedMedia
        ? { hasMediaAttachment: true, videoMessage: cachedMedia.videoMessage }
        : { hasMediaAttachment: false },
      body: { text: textoPrincipal },
      footer: { text: "༄ Đev Šoberano ×͜×" },
      nativeFlowMessage: {
        buttons: [
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "✨ MENU PRINCIPAL",
              id: `${_p}menupre`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🛡️ MENU ADM",
              id: `${_p}menuadm`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "👑 MENU DONO",
              id: `${_p}menudono`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🧩 BRINCADEIRAS",
              id: `${_p}menubrincadeiras`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🔞 MENU +18",
              id: `${_p}menu+18`
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "✦ 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
              url: global.canal
            })
          }
        ]
      }
    };

    console.log('[MENU] Montando mensagem interativa...');
    let msgi = generateWAMessageFromContent(m.chat, {
      interactiveMessage
    }, { userJid: conn.user.id, quoted: m });

    console.log('[MENU] Enviando via relayMessage...');
    await withTimeout(
      conn.relayMessage(m.chat, msgi.message, {
        messageId: msgi.key.id,
        additionalNodes: buildInteractiveNodes(m.chat)
      }),
      15000,
      'relayMessage (menu)'
    );
    console.log('[MENU] Menu enviado com sucesso.');
    await m.react('🖤');

  } catch (e) {
    console.error('[MENU] Erro:', e);
    await m.react('❌');
    conn.reply(m.chat, `❌ Erro no menu: ${e.message}`, m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menus', 'listmenu'];

export default handler;

function ucapan() {
  const time = moment.tz('America/Sao_Paulo').format('HH');
  if (time >= 5 && time < 12) return "𝘽𝙤𝙢 𝘿𝙞𝙖! ☀️";
  if (time >= 12 && time < 18) return "𝘽𝙤𝙖 𝙏𝙖𝙧𝙙𝙚! 🌤️";
  return "𝘽𝙤𝙖 𝙉𝙤𝙞𝙩𝙚! 🌙";
}