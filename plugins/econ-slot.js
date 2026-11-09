/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { delay } from "@whiskeysockets/baileys";
let cooldowns = {}

const TARGET_JID_DONO = '192380913328157@lid'; 
const DONO_PHONE = '5549920050811';

const handler = async (m, { args, usedPrefix, command, conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para jogar.* 🍷')

  if (!chat.users) chat.users = {}
  if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0 }
  let user = chat.users[m.sender]
  let nome = m.pushName || 'Explorador'

  const tempoEspera = 60 * 1000 
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
    let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
    return m.reply(`*⚠️ AGUARDE:* ${nome}, faltam ${restante}s para girar novamente.`)
  }

  const aposta = parseInt(args[0]?.replace(/[^0-9]/g, ''))
  if (!aposta || aposta < 100) return m.reply('*A aposta mínima é de R$ 100,00.*')
  if ((user.coin || 0) < aposta) return m.reply('*Saldo insuficiente na carteira.*')

  cooldowns[m.sender] = Date.now()
  const emojis = ['🍒', '💎', '🍀', '🍎', '💰'];
  
  const girar = () => emojis[Math.floor(Math.random() * emojis.length)];

  let { key } = await conn.sendMessage(m.chat, { text: '🎰 ｢ **CASSINO GÓTICA** ｣\n\n[ ⚡ ] *Puxando a alavanca...*' }, { quoted: m });

  // Animação profissional (Sincronizada e cadenciada)
  for (let i = 0; i < 5; i++) {
    await delay(500);
    let anim = `🎰 ｢ **CASSINO GÓTICA** ｣\n\n      ${girar()} : ${girar()} : ${girar()}\n    > ${girar()} : ${girar()} : ${girar()} <\n      ${girar()} : ${girar()} : ${girar()}\n\n[ ✨ ] *Girando os rolos...*`;
    await conn.sendMessage(m.chat, { text: anim, edit: key });
  }

  const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO);
  const sorte = eDono ? Math.random() < 0.70 : Math.random() < 0.30;
  
  let r1, r2, r3;
  if (sorte) {
    r1 = r2 = r3 = emojis[Math.floor(Math.random() * emojis.length)];
  } else {
    r1 = girar(); r2 = girar(); r3 = girar();
    if (r1 === r2 && r2 === r3) r3 = emojis.find(e => e !== r1); // Força perda se cair 3 iguais sem sorte
  }

  let finalMsg;
  if (r1 === r2 && r2 === r3) {
    const premio = aposta * 2;
    user.coin += premio;
    finalMsg = `✨ *VENCEMOS!* 🎉\n\n*Parabéns ${nome}, você faturou:* \n🎁 *R$ ${premio.toLocaleString('pt-br')}*`;
  } else {
    user.coin -= aposta;
    finalMsg = `💀 *DERROTA...*\n\n*Infelizmente ${nome}, você perdeu:* \n📉 *R$ ${aposta.toLocaleString('pt-br')}*`;
  }

  const resultadoFinal = `🎰 ｢ **CASSINO GÓTICA** ｣\n\n      ${girar()} : ${girar()} : ${girar()}\n    > ${r1} : ${r2} : ${r3} <\n      ${girar()} : ${girar()} : ${girar()}\n\n${finalMsg}\n\n💰 *Saldo Atual:* R$ ${user.coin.toLocaleString('pt-br')}`;
  
  await delay(800);
  await conn.sendMessage(m.chat, { text: resultadoFinal, edit: key });
  if (global.db.write) await global.db.write();
};

handler.help = ['cassino'];
handler.tags = ['economia'];
handler.command = ['slot', 'slots', 'cassino'];
handler.group = true;

export default handler;