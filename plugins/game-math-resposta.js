/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 */

let handler = m => m
handler.before = async function (m) {
    let id = m.chat;
    if (!(id in global.math)) return !0;
    if (!/^-?\d+$/i.test(m.text)) return !0;

    let math = global.math[id][1];
    let timeout = global.math[id][2];

    if (m.text == math.res) {
        // ACERTOU
        global.db.data.users[m.sender].exp += math.bonus;
        clearTimeout(timeout);
        
        await m.reply(`*✅ ACERTOU, @${m.sender.split('@')[0]}!* ✨\nVocê ganhou *${math.bonus} XP*. Próximo desafio vindo... 💋`, null, { mentions: [m.sender] });
        
        delete global.math[id];
        // Inicia o próximo nível automaticamente
        await global.sendMath(id, math.mode);
        
    } else {
        // ERROU - PARA O JOGO
        clearTimeout(timeout);
        delete global.math[id];
        await m.reply(`*❌ ERROU!* 🖤\n> A resposta era: *${math.res}*\n\nO jogo foi encerrado. Use o comando novamente para recomeçar. 💫`);
    }
    return !0;
}

export default handler;