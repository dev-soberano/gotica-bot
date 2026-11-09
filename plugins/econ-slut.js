/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {};

const TARGET_JID_DONO = '240041947357401@lid'; 
const DONO_PHONE = '556391330669';

const handler = async (m, { conn, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para realizar essa ação.* 🍷')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, lastslut: 0 }
    
    const user = chat.users[m.sender];
    const nome = m.pushName || 'Explorador';
    const senderId = m.sender;

    // Cooldown de 1 minuto (60000ms)
    const cooldown = 60 * 1000;
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
        const restante = Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000);
        return m.reply(`🥵 *Calma lá!* ${nome}, você precisa recuperar o fôlego. Volte em *${restante}s*.`);
    }

    const eDono = (senderId.includes(DONO_PHONE) || senderId === TARGET_JID_DONO);
    // Sorte do Dono: 85% | Membros: 70%
    const winChance = eDono ? 0.85 : 0.70;
    const didWin = Math.random() < winChance;

    // Pega alguém aleatório do grupo para a frase
    let participants = (await conn.groupMetadata(m.chat)).participants.map(p => p.id);
    let targetId = participants[Math.floor(Math.random() * participants.length)];

    if (didWin) {
        const amount = Math.floor(Math.random() * 10000 + 4000);
        user.coin = (user.coin || 0) + amount;
        await m.react('🥵');
        
        const phrase = pickRandom(frasesGanancia).replace('@usuario', `@${targetId.split('@')[0]}`);
        await conn.sendMessage(m.chat, {
            text: `🔥 ${phrase} e você ganhou *R$ ${amount.toLocaleString('pt-br')}*.`,
            mentions: [targetId]
        }, { quoted: m });

    } else {
        const loss = Math.floor(Math.random() * 8000 + 4000);
        user.coin = Math.max(0, (user.coin || 0) - loss);
        
        await m.react('💔');
        const phrase = pickRandom(frasesPerdida);
        await conn.reply(m.chat, `❌ ${phrase} e você perdeu *R$ ${loss.toLocaleString('pt-br')}*.`, m);
    }

    cooldowns[senderId] = Date.now();
    if (global.db.write) await global.db.write();
};

handler.help = ['slut'];
handler.tags = ['economia'];
handler.command = ['slut', 'prostituir', 'vadiar'];
handler.group = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const frasesGanancia = [
    "🤤 Você deu um show particular para @usuario e recebeu uma gorjeta gorda",
    "🔥 @usuario ficou impressionado com sua performance e te encheu de notas",
    "😩 Você fez o serviço completo para @usuario e saiu de bolsos cheios",
    "🤯 @usuario não resistiu ao seu charme e te pagou um valor absurdo",
    "😈 Você dominou @usuario a noite toda e o pagamento foi generoso",
    "💦 @usuario pagou extra só para você continuar o baile privado",
    "📸 Seu conteúdo exclusivo para @usuario rendeu um lucro incrível",
    "🛀 Você vendeu 'água de banho' para @usuario e ele pagou sem reclamar"
];

const frasesPerdida = [
    "😭 O cliente era um caloteiro e fugiu sem pagar",
    "🏥 Você se machucou durante o ato e o hospital ficou caro",
    "🤢 O cliente achou você desleixado e te deu um chute",
    "💔 Você começou a chorar falando do ex e o cliente cancelou tudo",
    "🚔 A polícia chegou no meio e você teve que pagar fiança",
    "🤡 Você se apaixonou pelo cliente e acabou pagando o jantar dele",
    "💥 Você quebrou a cama do motel e a multa foi altíssima",
    "📉 O cliente te pagou com notas falsas"
];