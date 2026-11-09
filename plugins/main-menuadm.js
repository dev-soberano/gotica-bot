/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

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
  await m.react('🛡️');
  try {
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let date = moment.tz('America/Sao_Paulo').format('DD/MM/YYYY');
    let version = '2.0.4';
    const gifVideosDir = path.join(process.cwd(), 'src', 'menu');
    let randomVideo = null;
    if (fs.existsSync(gifVideosDir)) {
        const files = fs.readdirSync(gifVideosDir).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv'));
        if (files.length > 0) {
            randomVideo = path.join(gifVideosDir, files[Math.floor(Math.random() * files.length)]);
        }
    }
    let media = await prepareWAMessageMedia(
        { video: randomVideo ? fs.readFileSync(randomVideo) : { url: 'https://files.catbox.moe/yyk5xo.jpg' }, gifPlayback: true }, 
        { upload: conn.waUploadToServer }
    );
    let texto = `┏╾═╼°✩•°: | ⊱⚙️⊰ | :°•✩°╾═╼┓ ┃ ✧𝗠𝗘𝗡𝗨 𝗔𝗗𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗔𝗧𝗜𝗩𝗢✧ ┗╾═╼°❃•°: | ⊱⚙️⊰ | :°•❃°╾═╼┛\n\n`
    
    texto += `*Controle total do grupo em suas mãos.* 🔒\n\n`

    // --- CATEGORIA: GERENCIAMENTO ---
    texto += `┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆\n`
    texto += `🚫 𝙂𝙀𝙍𝙀𝙉𝘾𝙄𝘼𝙈𝙀𝙉𝙏𝙊\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🚫❈┉━━━━─\n`
    texto += `┇┆🚪 ✦⋆͜͡҈➳ *${_p}ban* @user\n`
    texto += `┇┆🌍 ✦⋆͜͡҈➳ *${_p}banddd* [prefixo]\n`
    texto += `┇┆📋 ✦⋆͜͡҈➳ *${_p}listaddd*\n`
    texto += `┇┆⬆️ ✦⋆͜͡҈➳ *${_p}promover* @user\n`
    texto += `┇┆⬇️ ✦⋆͜͡҈➳ *${_p}rebaixar* @user\n`
    texto += `┇┆🔇 ✦⋆͜͡҈➳ *${_p}mutar* / *desmutar*\n`
    texto += `┇┆⚠️ ✦⋆͜͡҈➳ *${_p}advertidos*\n`
    texto += `┇┆📊 ✦⋆͜͡҈➳ *${_p}dashboard*\n`
    texto += `┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ\n\n`
    // --- CATEGORIA: CONFIGURAÇÕES ---
    texto += `┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆\n`
    texto += `⚙️ 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝘾̧𝙊̃𝙀𝙎\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟⚙️❈┉━━━━─\n`
    texto += `┇┆👋 ✦⋆͜͡҈➳ *${_p}welcome* [on/off]\n`
    texto += `┇┆📥 ✦⋆͜͡҈➳ *${_p}chegada* [texto]\n`
    texto += `┇┆📤 ✦⋆͜͡҈➳ *${_p}saida* [texto]\n`
    texto += `┇┆👁️ ✦⋆͜͡҈➳ *${_p}antivisu* [on/off]\n`
    texto += `┇┆🎭 ✦⋆͜͡҈➳ *${_p}autosticker* [on/off]\n`
    texto += `┇┆🆙 ✦⋆͜͡҈➳ *${_p}autolevelup* [on/off]\n`
    texto += `┇┆🕵️ ✦⋆͜͡҈➳ *${_p}x9* [on/off]\n`
    texto += `┇┆🖼️ ✦⋆͜͡҈➳ *${_p}fotogp*\n`
    texto += `┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ\n\n`
    // --- CATEGORIA: SEGURANÇA ---
    texto += `┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆\n`
    texto += `🛡️ 𝙎𝙀𝙂𝙐𝙍𝘼𝙉𝘾̧𝘼 𝙀 𝙋𝙍𝙊𝙏𝙀𝘾̧𝘼̃𝙊\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🛡️❈┉━━━━─\n`
    texto += `┇┆🚫 ✦⋆͜͡҈➳ *${_p}antibot* [on/off]\n`
    texto += `┇┆🔗 ✦⋆͜͡҈➳ *${_p}antilink* [on/off]\n`
    texto += `┇┆🕸️ ✦⋆͜͡҈➳ *${_p}antispam* [on/off]\n`
    texto += `┇┆👺 ✦⋆͜͡҈➳ *${_p}antifake* [on/off]\n`
    texto += `┇┆🚧 ✦⋆͜͡҈➳ *${_p}antitrava* [on/off]\n`
    texto += `┇┆🧼 ✦⋆͜͡҈➳ *${_p}limparvirus*\n`
    texto += `┇┆🗑️ ✦⋆͜͡҈➳ *${_p}apagarmsg*\n`
    texto += `┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ\n\n`
    // --- CATEGORIA: FERRAMENTAS ---
    texto += `┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆\n`
    texto += `📢 𝙁𝙀𝙍𝙍𝘼𝙈𝙀𝙉𝙏𝘼𝙎 𝙀 𝘼𝑑𝙄𝙎𝙊𝙎\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟📢❈┉━━━━─\n`
    texto += `┇┆📣 ✦⋆͜͡҈➳ *${_p}marcar*\n`
    texto += `┇┆🎐 ✦⋆͜͡҈➳ *${_p}hidetag*\n`
    texto += `┇┆💬 ✦⋆͜͡҈➳ *${_p}citar*\n`
    texto += `┇┆⏰ ✦⋆͜͡҈➳ *${_p}agendar*\n`
    texto += `┇┆🔗 ✦⋆͜͡҈➳ *${_p}linkgp*\n`
    texto += `┇┆ℹ️ ✦⋆͜͡҈➳ *${_p}infogrupo*\n`
    texto += `┇┆🖼️ ✦⋆͜͡҈➳ *${_p}qrcode*\n`
    texto += `┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ\n\n`
    texto += `> 😌 *A ordem é mantida por você!*\n`
    const interactiveMessage = {
      header: { hasMediaAttachment: true, videoMessage: media.videoMessage },
      body: { text: texto },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗗𝗔 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
              url: global.canal
            })
          }
        ]
      }
    };
    let msgi = generateWAMessageFromContent(m.chat, {
      interactiveMessage
    }, { userJid: conn.user.id, quoted: m });
    await conn.relayMessage(m.chat, msgi.message, {
      messageId: msgi.key.id,
      additionalNodes: buildInteractiveNodes(m.chat)
    });
  } catch (e) {
    console.error(e);
    m.reply('❌ Erro ao abrir o menu administrativo.');
  }
};
handler.help = ['menuadm'];
handler.tags = ['main'];
handler.command = ['menuadm', 'adm'];
export default handler;
function clockString(ms) {
  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let m = Math.floor(ms / 60000) % 60;
  let result = [];
  if (d > 0) result.push(`${d}d`);
  if (h > 0) result.push(`${h}h`);
  if (m > 0) result.push(`${m}m`);
  return result.length > 0 ? result.join(' ') : '0m';
}