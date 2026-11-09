/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch';

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

const handler = async (m, { args, usedPrefix, command, conn }) => {
  const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

  // REGRA SOBERANA: Leandro sem cooldown
  if (!eDono) {
    const tempoEspera = 10 * 1000 
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) return
    cooldowns[m.sender] = Date.now()
  }

  if (!args[0]) {
    return m.reply(`✳️ *Uso correto do comando:*\n${usedPrefix + command} <texto ou URL>\n\n🧩 *Exemplo:*\n${usedPrefix + command} https://github.com/leandromemes`);
  }

  await m.react('📱')

  try {
    const texto = encodeURIComponent(args.join(" "));
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${texto}`;

    await conn.sendMessage(m.chat, {
      image: { url: qrURL },
      caption: `✅ *QR CODE GERADO COM SUCESSO*\n\n📎 *Conteúdo:* ${args.join(" ")}`
    }, { quoted: m });
    
    await m.react('✅')
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocorreu um erro ao gerar o QR Code.');
  }
};

handler.help = ['qrcode <link/texto>']
handler.tags = ['tools']
handler.command = ['qrcode', 'qr']
handler.register = false // SEM TRAVA DE REGISTRO

export default handler;