/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `🍬 Use desta forma: *${usedPrefix}calcular [tipo] [@usuario | nome]*\n\nExemplos:\n> ${usedPrefix}calcular gay @usuario\n> ${usedPrefix}calcular feio João`, m);

    let [tipo, ...rest] = text.split(" ");
    if (!tipo) return m.reply(`🍭 Você precisa informar o tipo que deseja calcular.\nExemplo: *${usedPrefix}calcular gay @usuario*`);
    
    let nombre = rest.join(" ");
    if (!nombre) return m.reply(`🍭 Você precisa mencionar alguém ou digitar um nome.\nExemplo: *${usedPrefix}calcular ${tipo} João*`);

    // Geração de porcentagem aleatória de 0 a 500
    const percentages = Math.floor(Math.random() * 501);
    let emoji = '';
    let description = '';

    switch (tipo.toLowerCase()) {
        case 'gay':
            emoji = '🏳️‍🌈';
            if (percentages < 50) {
                description = `💙 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* Gay ${emoji}\n> ✰ Isso é baixo, você é no máximo simpático!`;
            } else if (percentages > 100) {
                description = `💜 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* Gay ${emoji}\n> ✰ Mais gay do que a gente imaginava!`;
            } else {
                description = `🖤 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* Gay ${emoji}\n> ✰ É, a sua praia é essa mesmo!`;
            }
            break;
        case 'lesbica':
        case 'lesbica':
            emoji = '🏳️‍🌈';
            description = `💗 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* Lésbica ${emoji}\n> ✰ Mantenha o amor florescendo!`;
            break;
        case 'punheteiro':
        case 'punheteira':
            emoji = '😏💦';
            description = `💞 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* ${tipo} ${emoji}\n> ✰ Continue o bom trabalho (solo).`;
            break;
        case 'puto':
        case 'puta':
            emoji = '🔥🥵';
            description = `😺 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* ${tipo} ${emoji}\n> ✰ Mantendo esse charme ardente!`;
            break;
        case 'vesgo':
        case 'vesga':
        case 'pauroso':
            emoji = '💩';
            description = `🥷 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* ${tipo} ${emoji}\n> ✰ Mantenha a coragem!`;
            break;
        case 'rato':
        case 'rata':
            emoji = '🐁';
            description = `👑 Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* ${tipo} ${emoji}\n> ✰ Coma queijo com responsabilidade!`;
            break;
        case 'prostituto':
        case 'prostituta':
            emoji = '🫦👅';
            description = `✨️ Os cálculos apontam que ${nombre.toUpperCase()} é *${percentages}%* ${tipo} ${emoji}\n> ✰ Negócios são negócios!`;
            break;
        default:
            return m.reply(`🍭 Tipo inválido.\nOpções válidas: gay, lesbica, punheteiro/punheteira, puto/puta, vesgo/vesga, rato/rata, prostituto/prostituta`);
    }

    const responses = [
        "O universo falou.",
        "Os cientistas confirmaram.",
        "Que surpresa!",
        "Sem dúvidas sobre isso."
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    const cal = `💫 *CALCULADORA*\n\n${description}\n\n➤ ${response}`.trim();

    async function loading() {
        var hawemod = [
            "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
            "《 ████▒▒▒▒▒▒▒▒》30%",
            "《 ███████▒▒▒▒▒》50%",
            "《 ██████████▒▒》80%",
            "《 ████████████》100%"
        ];

        let mentions = conn.parseMention ? conn.parseMention(cal) : [];

        let { key } = await conn.sendMessage(m.chat, { 
            text: `🤍 Calculando Porcentagem...`, 
            mentions 
        }, { quoted: m });

        for (let i = 0; i < hawemod.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            await conn.sendMessage(m.chat, { 
                text: hawemod[i], 
                edit: key, 
                mentions 
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { 
            text: cal, 
            edit: key, 
            mentions 
        }, { quoted: m });
    }

    loading();
};

handler.help = ['calcular <tipo> <@tag|nome>'];
handler.tags = ['fun'];
handler.register = true;
handler.group = true;
handler.command = ['calcular'];

export default handler;