/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, args }) => {
    // Puxa os usuários da database global
    let users = Object.entries(global.db.data.users).map(([key, value]) => {
        return { 
            jid: key,
            name: value.name,
            // Soma o money (do tráfico), limit e bank garantindo que não venha nulo
            total: (Number(value.money) || 0) + (Number(value.limit) || 0) + (Number(value.bank) || 0)
        };
    }).filter(u => u.total > 0); // Só mostra quem tem pelo menos 1 real

    // Ordena do maior para o menor
    let sortedRicos = users.sort((a, b) => b.total - a.total);
    
    let page = parseInt(args[0]) || 1;
    let pageSize = 10;
    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    
    let totalPages = Math.ceil(sortedRicos.length / pageSize);
    const iconos = ['🥇', '🥈', '🥉'];

    if (sortedRicos.length === 0) {
        return m.reply('*Opa, Soberano!* ✋ Ninguém no bot tem dinheiro ainda. Vá traficar mais! 💸')
    }

    let texto = `◢✨ *RANKING GLOBAL DE RICOS* ✨◤\n\n`;

    let slice = sortedRicos.slice(startIndex, endIndex);
    
    if (slice.length === 0) return m.reply('*Página não encontrada!*')

    texto += slice.map(({ jid, total, name }, i) => {
        let rankPos = startIndex + i + 1;
        let icono = iconos[rankPos - 1] || '💰';
        
        // Pega o nome real ou usa Magnata + final do número
        let nomeUser = name || conn.getName(jid) || `Magnata #${jid.split('@')[0].slice(-4)}`;
        
        // Formata para R$
        let formatado = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

        return `${icono} ${rankPos}º » *${nomeUser}*\n\t\t 💸 *Fortuna:* ${formatado}`;
    }).join('\n\n');

    texto += `\n\n________________________\n`;
    texto += `> • Página *${page}* de *${totalPages}*`;
    
    if (page < totalPages) {
        texto += `\n> Próxima página » *#topglobal ${page + 1}*`;
    }

    await conn.reply(m.chat, texto.trim(), m, { 
        mentions: slice.map(u => u.jid) 
    });
}

handler.help = ['topglobal'];
handler.tags = ['rpg'];
handler.command = ['top', 'topglobal', 'rankglobal', 'fortuna']; 
handler.group = true;
handler.register = false; 

export default handler;