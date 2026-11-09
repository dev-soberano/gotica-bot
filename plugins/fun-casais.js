/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let toM = (a) => "@" + a.split("@")[0];

async function handler(m, { groupMetadata, conn }) {
  let ps = groupMetadata.participants.map((v) => v.id);
  
  // Se o grupo tiver menos de 10 pessoas, avisa para não travar
  if (ps.length < 10) return m.reply('*💋 Soberano, o grupo precisa de pelo menos 10 pessoas para formar os 5 casais!* 🖤')

  // Embaralha a lista (Fisher-Yates Shuffle)
  for (let i = ps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ps[i], ps[j]] = [ps[j], ps[i]];
  }

  // Pega os 10 primeiros participantes embaralhados
  let [a, b, c, d, e, f, g, h, i, j] = ps;

  let str = `╭──⭑꒷꒦꒷〘 CASAIS 〙꒷꒦꒷⭑──╮\n\n`
  str += `*💋 As 5 melhores combinações do grupo:* ✨\n\n`
  
  str += `*1.*- ${toM(a)} e ${toM(b)}\n`
  str += `> Este casal está destinado a ficar junto para sempre. 🖤\n\n`
  
  str += `*2.*- ${toM(c)} e ${toM(d)}\n`
  str += `> Dois pombinhos apaixonados sob o luar. 💫\n\n`
  
  str += `*3.*- ${toM(e)} e ${toM(f)}\n`
  str += `> Uau! Esses dois já deveriam ter uma família. 🤱✨\n\n`
  
  str += `*4.*- ${toM(g)} e ${toM(h)}\n`
  str += `> Casaram-se em segredo e ninguém percebeu. 💍🌙\n\n`
  
  str += `*5.*- ${toM(i)} e ${toM(j)}\n`
  str += `> Este casal está curtindo uma lua de mel inesquecível. 🥵⭐\n\n`
  
  str += `╰─⭑꒷꒦꒷〘 💋⭐✨💫🌙🖤 〙꒷꒦꒷⭑─╯`

  await conn.reply(m.chat, str, m, {
    mentions: [a, b, c, d, e, f, g, h, i, j],
  });
}

handler.help = ["formarcasais"];
handler.tags = ["fun"];
handler.command = ["formarcasais", "formacasal"];

handler.register = false;
handler.group = true;

export default handler;