/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 *
 * Status (ativado/desativado) de funções de grupo lido do MESMO arquivo
 * físico que o painel (!menuprot) usa (src/database/grupos/<grupo>.json),
 * não mais só do global.db.data.chats, pra nunca mais desincronizar.
 *
 * Mensagens no padrão limpo (igual o !antilink): *título*, _status_,
 * citação com > pros comandos, botão do canal. Sem fonte estilizada,
 * sem forjar notificação oficial do WhatsApp.
 */

import fs from 'fs';
import path from 'path';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const featureNames = {
  'welcome': 'Boas-Vindas', 'bv': 'Boas-Vindas', 'bienvenida': 'Boas-Vindas',
  'antiprivado': 'Anti-Privado', 'antipriv': 'Anti-Privado', 'antiprivate': 'Anti-Privado',
  'antiPorno': 'Anti-Porno',
  'restrict': 'Restringir', 'restringir': 'Restringir',
  'autolevelup': 'Modo Real', 'autonivel': 'Modo Real', 'levelrico': 'Modo Real', 'nivelricos': 'Modo Real', 'modoreal': 'Modo Real',
  'audios': 'Áudios',
  'autosticker': 'Auto Sticker',
  'antibot': 'Anti-Bot', 'antibots': 'Anti-Bot',
  'autoaceptar': 'Auto Aceitar', 'aceptarauto': 'Auto Aceitar',
  'antiestrangeiro': 'Anti-Estrangeiro', 'autorechazar': 'Anti-Estrangeiro', 'rechazarauto': 'Anti-Estrangeiro',
  'autoresponder': 'Auto Responder', 'autorespond': 'Auto Responder',
  'antisubbots': 'Anti-Sub Bots', 'antisub': 'Anti-Sub Bots', 'antisubot': 'Anti-Sub Bots', 'antibot2': 'Anti-Sub Bots',
  'modoadmin': 'Modo Admin', 'soloadmin': 'Modo Admin',
  'autoread': 'Auto Ler', 'autoleer': 'Auto Ler', 'autover': 'Auto Ler',
  'antiver': 'Anti-Visu', 'antiocultar': 'Anti-Visu', 'antiviewonce': 'Anti-Visu', 'antivisu': 'Anti-Visu', 'antivisuunica': 'Anti-Visu',
  'reaction': 'Reações', 'reaccion': 'Reações', 'emojis': 'Reações',
  'nsfw': 'NSFW (+18)', 'nsfwhot': 'NSFW', 'nsfwhorny': 'NSFW',
  'antispam': 'Anti-Spam', 'antiSpam': 'Anti-Spam', 'antispamosos': 'Anti-Spam',
  'antidelete': 'Anti-Deletar', 'antieliminar': 'Anti-Deletar',
  'jadibotmd': 'Modo JadiBot', 'modejadibot': 'Modo JadiBot',
  'detect': 'Detecção', 'configuraciones': 'Detecção', 'avisodegp': 'Detecção',
  'detect2': 'Detecção 2', 'avisos': 'Detecção 2', 'eventos': 'Detecção 2',
  'autosimi': 'SimSimi (IA)', 'simsimi': 'SimSimi (IA)',
  'antilink': 'Anti-Links', 'antilink2': 'Anti-Links 2', 'antilinkgp': 'Anti-Links GP', 'antiflood': 'Anti-Flood', 'antiflod': 'Anti-Flood',
  'antitrabas': 'Anti-Travas', 'antitraba': 'Anti-Travas',
  'antifake': 'Anti-Fakes', 'antivirtuales': 'Anti-Fakes',
  'antitoxic': 'Anti-Tóxico', 'antitoxicos': 'Anti-Tóxico',
  'antipagamento': 'Anti-Pagamento', 'antipay': 'Anti-Pagamento', 'antipix': 'Anti-Pagamento'
};

// Ícone por função — cai num padrão genérico se não tiver um específico
const featureIcons = {
  'antilink': '🔗', 'antilink2': '🔗', 'antilinkgp': '🔗',
  'antiflood': '🚨', 'antiflod': '🚨',
  'welcome': '👋', 'antiver': '👁️', 'antiPorno': '🔞', 'autolevelup': '💎',
  'audios': '🎧', 'autosticker': '🏷️', 'antibot': '🤖', 'autoaceptar': '✅',
  'antiestrangeiro': '🌍', 'autoresponder': '💬', 'antisubbots': '🤖',
  'modoadmin': '🛡️', 'autoread': '📖', 'reaction': '😀', 'nsfw': '🔞',
  'antispam': '🚫', 'antidelete': '🗑️', 'jadibotmd': '🧩', 'detect': '🔍',
  'detect2': '🔍', 'autosimi': '🧠', 'antitrabas': '🔧', 'antifake': '🕵️',
  'antitoxic': '🤬', 'antipagamento': '💰', 'antiprivado': '🔒', 'restrict': '🔐'
};

// Funções cujo status "de verdade" mora no arquivo físico do grupo
// (o mesmo que o painel !menuprot lê) — não no global.db.
const groupScopedTypes = [
  'welcome', 'antiver', 'antiPorno', 'autolevelup', 'audios', 'autosticker',
  'antibot', 'autoaceptar', 'antiestrangeiro', 'autoresponder', 'antisubbots',
  'modoadmin', 'reaction', 'nsfw', 'detect', 'detect2', 'autosimi',
  'antilink', 'antilink2', 'antilinkgp', 'antiflood',
  'antitrabas', 'antipagamento'
];

function caminhoArquivoGrupo(chatId) {
  const dirGrupos = path.join(process.cwd(), 'src', 'database', 'grupos');
  if (!fs.existsSync(dirGrupos)) fs.mkdirSync(dirGrupos, { recursive: true });
  const cleanFrom = chatId.split('@')[0] + '@g.us';
  return path.join(dirGrupos, `${cleanFrom}.json`);
}

function lerStatusArquivoGrupo(chatId, type) {
  try {
    const caminho = caminhoArquivoGrupo(chatId);
    if (!fs.existsSync(caminho)) return false;
    const content = fs.readFileSync(caminho, 'utf-8');
    const jsonGp = content ? JSON.parse(content) : [];
    const config = Array.isArray(jsonGp) ? jsonGp[0] : jsonGp;
    return !!(config && config[type] === true);
  } catch (e) {
    return false;
  }
}

// --- Botão do canal (mesmo padrão do !fechar/!abrir/!antilink/!antiflood) ---
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

async function sendComBotao(conn, chatId, texto, quoted) {
  const interactiveMessage = {
    header: { hasMediaAttachment: false },
    body: { text: texto },
    nativeFlowMessage: {
      buttons: [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
            url: global.canal || "https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K"
          })
        }
      ]
    }
  };

  try {
    const msgi = generateWAMessageFromContent(chatId, { interactiveMessage }, { userJid: conn.user.id, quoted });
    await conn.relayMessage(chatId, msgi.message, {
      messageId: msgi.key.id,
      additionalNodes: buildInteractiveNodes(chatId)
    });
  } catch (e) {
    console.error('[NABLE] Erro ao enviar msg com botão, caindo pro texto simples:', e);
    await conn.reply(chatId, texto, quoted).catch(() => {});
  }
}

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  // Prevenção de erro: garante que global.db.data e chats existam
  if (!global.db.data) global.db.data = { users: {}, chats: {}, settings: {} };
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = command.toLowerCase();
  let isAll = false;
  const isSoberano = isOwner || isROwner || m.sender.includes('240041947357401');

  // Normalização
  if (['antivisu', 'antivisuunica', 'antiviewonce', 'antiocultar'].includes(type)) type = 'antiver';
  if (['modoreal', 'nivelricos', 'levelrico', 'autonivel'].includes(type)) type = 'autolevelup';
  if (['antiestrangeiro', 'antiesterangeiro', 'autorechazar', 'rechazarauto'].includes(type)) type = 'antiestrangeiro';
  if (['antipay', 'antipix'].includes(type)) type = 'antipagamento';
  if (['antiflod'].includes(type)) type = 'antiflood';
  if (['antispam', 'antispamosos'].includes(type)) type = 'antispam';

  const nome = featureNames[command.toLowerCase()] || type;
  const icone = featureIcons[type] || '⚙️';

  // --- Verificação de Estado Atual ---
  let currentStatus = type === 'autolevelup'
    ? (chat.autolevelup === true || chat.modoreal === true || chat.real === true)
    : chat[type] === true;

  if (['antiprivado', 'antipriv', 'antiprivate'].includes(type)) currentStatus = bot.antiPrivate === true;
  if (['restrict', 'restringir'].includes(type)) currentStatus = bot.restrict === true;
  if (['antispam', 'antiSpam'].includes(type)) currentStatus = bot.antiSpam === true;
  if (['jadibotmd', 'modejadibot'].includes(type)) currentStatus = bot.jadibotmd === true;
  if (['autoread', 'autoleer'].includes(type)) currentStatus = global.opts['autoread'] === true;

  // CORREÇÃO: pra funções de grupo, o arquivo físico (o que o painel lê) manda
  if (m.isGroup && groupScopedTypes.includes(type)) {
    currentStatus = lerStatusArquivoGrupo(m.chat, type);
  }

  // Rodapé extra só pro antiflood, lembrando do comando que ajusta o número
  const rodapeFlood = type === 'antiflood'
    ? `\n\n_Use *!setflood <msgs> <segundos>* para configurar o limite de mensagens._`
    : '';

  if (args[0] === 'on' || args[0] === 'enable' || args[0] === '1') {
    if (currentStatus === true) {
      const texto = `*${icone} ${nome.toUpperCase()}*\n\n_Opa!_ Essa função *já está ATIVADA* ✅${rodapeFlood}`;
      return sendComBotao(conn, m.chat, texto, m);
    }
    var isEnable = true;
  } else if (args[0] === 'off' || args[0] === 'disable' || args[0] === '0') {
    if (currentStatus === false) {
      const texto = `*${icone} ${nome.toUpperCase()}*\n\n_Opa!_ Essa função *já está DESATIVADA* ❌${rodapeFlood}`;
      return sendComBotao(conn, m.chat, texto, m);
    }
    var isEnable = false;
  } else {
    const texto =
      `*${icone} ${nome.toUpperCase()}*\n\n` +
      `_Status atual:_ ${currentStatus ? '*ATIVADO* ✅' : '*DESATIVADO* ❌'}\n\n` +
      `_Pra ligar/desligar:_\n` +
      `> *${usedPrefix}${command} on*\n` +
      `> *${usedPrefix}${command} off*` +
      rodapeFlood;
    return sendComBotao(conn, m.chat, texto, m);
  }

  // Execução e Salvamento
  switch (type) {
    case 'welcome': case 'antiver': case 'antiPorno': case 'autolevelup': case 'audios':
    case 'autosticker': case 'antibot': case 'autoaceptar': case 'antiestrangeiro':
    case 'autoresponder': case 'antisubbots': case 'modoadmin': case 'reaction':
    case 'nsfw': case 'detect': case 'detect2': case 'autosimi':
    case 'antilink': case 'antilink2': case 'antilinkgp': case 'antiflood': case 'antitrabas':
    case 'antipagamento':
      if (m.isGroup && !isAdmin && !isSoberano) return global.dfail('admin', m, conn);

      chat[type] = isEnable;

      // Garantia para o Modo Real sincronizar em todas as chaves usadas por outros plugins
      if (type === 'autolevelup') {
        chat.modoreal = isEnable;
        chat.real = isEnable;
        chat.autolevelup = isEnable;
      }

      // Sincronização individual por arquivo local do grupo (fonte de verdade, lida pelo painel)
      if (m.isGroup) {
        try {
          const caminho = caminhoArquivoGrupo(m.chat);
          let jsonGp = [];
          if (fs.existsSync(caminho)) {
            const content = fs.readFileSync(caminho, 'utf-8');
            jsonGp = content ? JSON.parse(content) : [];
          }
          if (!Array.isArray(jsonGp)) jsonGp = [];
          if (!jsonGp[0] || typeof jsonGp[0] !== 'object') jsonGp[0] = {};

          jsonGp[0][type] = isEnable;
          if (type === 'autolevelup') {
            jsonGp[0]['modoreal'] = isEnable;
            jsonGp[0]['real'] = isEnable;
          }

          fs.writeFileSync(caminho, JSON.stringify(jsonGp, null, 2));
        } catch (err) {
          console.error('Erro ao sincronizar arquivo do grupo:', err);
        }
      }
      break;

    case 'antiprivado': case 'restrict': case 'antispam': case 'jadibotmd':
      isAll = true;
      if (!isSoberano) return global.dfail('rowner', m, conn);
      if (type === 'antispam') bot.antiSpam = isEnable;
      if (type === 'restrict') bot.restrict = isEnable;
      if (type === 'antiprivado') bot.antiPrivate = isEnable;
      if (type === 'jadibotmd') bot.jadibotmd = isEnable;
      break;

    case 'autoread':
      isAll = true;
      if (!isSoberano) return global.dfail('rowner', m, conn);
      global.opts['autoread'] = isEnable;
      break;
  }

  let replyText =
    `*${icone} ${nome.toUpperCase()}*\n\n` +
    (isEnable
      ? `> ✅ Função *ATIVADA* com sucesso!`
      : `> 🔕 Função *DESATIVADA* com sucesso!`) +
    `\n\n_Aplicado ${isAll ? 'para o Bot' : 'para este chat'}._`;

  if (type === 'antiestrangeiro' && isEnable) {
    replyText += `\n\n_*Prefixos Bloqueados:*_ [6, 90, 963, 966, 967, 249, 212, 92, 93, 94, 7, 49, 2, 91, 48]`;
  }

  if (type === 'antiflood') {
    replyText += rodapeFlood;
  }

  await m.react(isEnable ? '✅' : '⚠️');

  await sendComBotao(conn, m.chat, replyText, m);
};

handler.help = ['config'];
handler.tags = ['nable'];
handler.command = ['welcome', 'audios', 'bv', 'bienvenida', 'antiprivado', 'antipriv', 'antiprivate', 'restrict', 'restringir', 'autolevelup', 'autonivel', 'levelrico', 'nivelricos', 'modoreal', 'autosticker', 'antibot', 'antibots', 'autoaceptar', 'aceptarauto', 'antiestrangeiro', 'antiesterangeiro', 'autorechazar', 'rechazarauto', 'autoresponder', 'autorespond', 'antisubbots', 'antisub', 'antisubot', 'antibot2', 'modoadmin', 'soloadmin', 'autoread', 'autoleer', 'autover', 'antiver', 'antiocultar', 'antiviewonce', 'antivisu', 'antivisuunica', 'reaction', 'reaccion', 'emojis', 'nsfw', 'nsfwhot', 'nsfwhorny', 'antispam', 'antiSpam', 'antispamosos', 'jadibotmd', 'modejadibot', 'subbots', 'detect', 'configuraciones', 'avisodegp', 'detect2', 'avisos', 'eventos', 'autosimi', 'simsimi', 'antilink', 'antilink2', 'antilinkgp', 'antiflood', 'antiflod', 'antitraba', 'antitrabas', 'antipagamento', 'antipay', 'antipix'];
// "antifake"/"antivirtuales" removidos daqui de propósito — já tem um
// "antidelete"/"antieliminar" removidos daqui de propósito — já tem um
// comando dedicado (main-antidelete.js) cuidando deles, com botão e
// formatação própria, e a detecção/cache rodando direto no index.js.
// "antitoxic"/"antitoxicos" removidos daqui de propósito — já tem um
// comando dedicado (main-antitoxico.js) cuidando deles.
// Registrar os dois ao mesmo tempo causa a mesma colisão de comando que
// já resolvemos no antilink/antipagamento/antifake/antidelete.
// comando dedicado (main-antifake.js) cuidando deles, com botão e
// formatação própria. Registrar os dois ao mesmo tempo causa a mesma
// colisão de comando que já resolvemos no antilink/antipagamento.

export default handler;