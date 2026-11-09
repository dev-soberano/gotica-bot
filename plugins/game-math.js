/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

global.math = global.math ? global.math : {};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const modes = {
    noob: [-3, 3, -3, 3, '+-', 15000, 50],
    easy: [-10, 10, -10, 10, '*/+-', 20000, 100],
    medium: [-40, 40, -20, 20, '*/+-', 40000, 300],
    hard: [-100, 100, -70, 70, '*/+-', 60000, 700]
  };

  if (args.length < 1) return conn.reply(m.chat, `*💋 Escolha a dificuldade:* ${Object.keys(modes).join(' | ')}`, m);

  let mode = args[0].toLowerCase();
  if (!(mode in modes)) return conn.reply(m.chat, `*❌ Dificuldade inválida!*`, m);

  let id = m.chat;
  if (id in global.math) return conn.reply(m.chat, `*⭐ Já existe um desafio ativo!*`, global.math[id][0]);

  // Função para gerar e enviar o desafio (reutilizável)
  global.sendMath = async (chatId, dificuldade) => {
    let [a1, a2, b1, b2, ops, time, bonus] = modes[dificuldade];
    let a = Math.floor(Math.random() * (a2 - a1) + a1);
    let b = Math.floor(Math.random() * (b2 - b1) + b1);
    let op = ops[Math.floor(Math.random() * ops.length)];
    let res = eval(`${a} ${op.replace('x', '*').replace('÷', '/')} ${b}`);
    
    let str = `${a} ${op.replace('*', 'x').replace('/', '÷')} ${b}`;
    
    let txt = `╭⭑꒷꒦꒷〘 MATEMATICA 〙꒷꒦꒷⭑╮\n\n`;
    txt += `> *Quanto é:* ${str}?\n\n`;
    txt += `*🎁 Prémio:* ${bonus} XP ✨\n`;
    txt += `*⚠️ Se errar, o jogo para!* 🖤\n\n`;
    txt += `╰──⭑꒷꒦꒷〘 💋 〙꒷꒦꒷⭑──╯`;

    global.math[chatId] = [
      await conn.reply(chatId, txt, null),
      { res, bonus, mode: dificuldade },
      setTimeout(() => {
        if (global.math[chatId]) {
          conn.reply(chatId, `*🌙 Tempo esgotado!*\n> Resposta: ${res}\nO jogo acabou. 🖤`, global.math[chatId][0]);
          delete global.math[chatId];
        }
      }, time)
    ];
  };

  await global.sendMath(id, mode);
};

handler.command = ['matematica', 'matemática'];
handler.group = true;
export default handler;