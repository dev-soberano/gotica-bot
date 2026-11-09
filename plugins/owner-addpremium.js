/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let quem;
  if (m.isGroup) quem = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else quem = m.chat;

  // Guia de exemplos que aparecerá se o comando for enviado incompleto
  const guiaExemplo = `*⚠️ SOBERANO, VEJA COMO USAR:*

✨ *Exemplos com @tag:*
*${usedPrefix + command}* @usuário 5

✨ *Exemplos respondendo mensagem:*
*${usedPrefix + command}* 5

📌 *VARIAÇÕES DE TEMPO:*
*${usedPrefix}addprem* ➔ Horas
*${usedPrefix}addprem2* ➔ Dias
*${usedPrefix}addprem3* ➔ Semanas
*${usedPrefix}addprem4* ➔ Meses

_Basta escolher o comando e colocar o número na frente._`

  // Se o Soberano não marcou ninguém ou não respondeu a uma mensagem
  if (!quem) return m.reply(guiaExemplo, null, { mentions: conn.parseMention(guiaExemplo) });

  // Pega apenas o número do texto, removendo a menção
  const txt = text.replace('@' + quem.split`@`[0], '').trim();

  // Se o número estiver faltando ou for inválido
  if (!txt || isNaN(txt)) return m.reply(guiaExemplo);
  
  const user = global.db.data.users[quem];
  if (!user) return m.reply(`*⚠️ Esse usuário não está na minha base de dados.*`);

  const nomeAlvo = await conn.getName(quem);
  const agora = Date.now();
  let tempoAdicional = 0;
  let unidade = '';

  if (command === 'addprem' || command === 'userpremium') {
    tempoAdicional = 60 * 60 * 1000 * parseInt(txt);
    unidade = 'hora(s)';
  } else if (command === 'addprem2' || command === 'userpremium2') {
    tempoAdicional = 24 * 60 * 60 * 1000 * parseInt(txt);
    unidade = 'dia(s)';
  } else if (command === 'addprem3' || command === 'userpremium3') {
    tempoAdicional = 7 * 24 * 60 * 60 * 1000 * parseInt(txt);
    unidade = 'semana(s)';
  } else if (command === 'addprem4' || command === 'userpremium4') {
    tempoAdicional = 30 * 24 * 60 * 60 * 1000 * parseInt(txt);
    unidade = 'mês(es)';
  }

  // Soma o tempo se já for premium ou define novo
  user.premiumTime = (user.premiumTime > agora) ? user.premiumTime + tempoAdicional : agora + tempoAdicional;
  user.premium = true;

  const restante = await formatarTempo(user.premiumTime - agora);

  m.reply(`*🎟️ PREMIUM ADICIONADO!*

✨ *Usuário:* ${nomeAlvo}
🕐 *Tempo:* ${txt} ${unidade}
📉 *Total:* ${restante}`, null, { mentions: [quem] });
};

handler.help = ['addprem [@user] <tempo>'];
handler.tags = ['owner'];
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'];
handler.group = true;
handler.rowner = true;

export default handler;

async function formatarTempo(ms) {
  let segundos = Math.floor(ms / 1000);
  let minutos = Math.floor(segundos / 60);
  let horas = Math.floor(minutos / 60);
  let dias = Math.floor(horas / 24);
  segundos %= 60; minutos %= 60; horas %= 24;

  let res = '';
  if (dias) res += `${dias}d `;
  if (horas) res += `${horas}h `;
  if (minutos) res += `${minutos}m `;
  if (segundos) res += `${segundos}s`;
  return res.trim();
}