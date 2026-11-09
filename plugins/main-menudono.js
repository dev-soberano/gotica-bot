/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 *
 * CORRIGIDO: esse arquivo calculava sua própria "isAnyOwner" comparando
 * os dígitos crus de m.sender contra getAllOwners() — mas quando quem
 * manda a mensagem aparece pro bot como @lid (não é contato salvo), os
 * dígitos de m.sender são do identificador oculto, não do telefone real
 * salvo em owners.json, então a comparação sempre falhava pros donos
 * extras (slots 2-6, adicionados via !adddono1-5). Agora usa "isOwner"
 * do contexto do handler.js, que já é soberano OU dono-extra, com a
 * resolução de @lid feita centralizadamente lá.
 */
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getAllOwners } from '../lib/owners.js';

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

  if (!chatId.endsWith('@g.us')) {
    nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
  }

  return nodes;
}

let handler = async (m, { conn, usedPrefix: _p, isSoberano, isOwner }) => {
  // isOwner já vem do handler.js como soberano OU dono-extra, com @lid
  // resolvido. getAllOwners() + senderNum crus ficam só de fallback.
  const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
  const senderNum = String(m.sender).split('@')[0].replace(/[^0-9]/g, '')
  const isAnyOwner = isOwner || isSoberano || allOwners.includes(senderNum)

  if (!isAnyOwner) {
    await m.react('🖕');
    return conn.reply(m.chat, `😒 *Quem você pensa que é?* Hum? Você é apenas um pobre plebeu sem brilho tentando tocar nas funções do meu *Mestre Supremo Dev Soberano*! Afaste-se! 🖤`, m);
  }

  await m.react('👑');
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
    let texto = `┏━ 👑 𝗠𝗘𝗡𝗨 𝗗𝗢𝗡𝗢 👑 ━┓\n\n`

    texto += `*Saudações, Soberano!* 🍷\n`
    texto += `É uma honra ter você aqui, fique à vontade. ⚔️\n\n`
    texto += `🔱 𝙋𝙊𝘿𝙀𝙍 𝙎𝙐𝙋𝙍𝙀𝙈𝙊\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟👑❈┉━━━━─\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}on*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}off*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}reiniciar*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}sair*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}seradm*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}ignorar*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}atender*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}ignorados*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}apagarmsg*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}listadegrupos*\n`
    texto += `ი ̯👑 ✦⋆͜͡҈➳ *${_p}antiprivado* [on/off]\n\n`
    texto += `⚡ 𝙁𝙀𝙍𝙍𝘼𝙈𝙀𝙉𝙏𝘼𝙎 𝙎𝙐𝙋𝙍𝙀𝙈𝘼𝙎\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟⚙️❈┉━━━━─\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}aviso*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}prefix*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}detcplugins*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}delsession*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}rastrearip*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}limpartmp*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}ofuscar*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}github*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}comprimir*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}fake*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}uptime*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}horario*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}ip*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}setmsg* [gatilho]\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}delmsg* [gatilho]\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}listmsg*\n`
    texto += `ი ̯⚙️ ✦⋆͜͡҈➳ *${_p}apagarmsg*\n\n`
    texto += `💎 𝙏𝙀𝙎𝙊𝙐𝙍𝙊 𝙍𝙀𝘼𝙇\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟💎❈┉━━━━─\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}addxp*\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}addmoney*\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}addprem*\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}delpremium*\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}listprem*\n`
    texto += `ი ̯💎 ✦⋆͜͡҈➳ *${_p}checkprem*\n\n`
    texto += `🏰 𝙂𝙐𝘼𝙍𝘿𝘼 𝘿𝙊 𝙍𝙀𝙄𝙉𝙊\n`
    texto += `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🛡️❈┉━━━━─\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}block*\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}setppbot*\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}nuke*\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}leavegc*\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}exec_global*\n`
    texto += `ი ̯🛡️ ✦⋆͜͡҈➳ *${_p}bangeral*\n\n`
    texto += `├╼╼╼╼╼╼╍⋅⊹⋅⋅⦁ ✪ ⦁⋅⋅⊹⋅╍╾╾╾╾☾⋆\n\n`
    texto += `> 🧛 *Gótica Bot está sob seu total domínio, Majestade.* 🩸\n`
    texto += `> 👇 *ACESSO AO SEU REPOSITÓRIO* 👇`.trim();

    const interactiveMessage = {
      header: { hasMediaAttachment: true, videoMessage: media.videoMessage },
      body: { text: texto },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🏰 Github do soberano",
              url: "https://github.com/leandromemes"
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
    m.reply('❌ Soberano, a matriz encontrou uma resistência. Erro ao gerar o menu.');
  }
};
handler.help = ['menudono'];
handler.tags = ['main'];
handler.command = ['menudono', 'lord', 'master'];
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