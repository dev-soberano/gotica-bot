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

let handler = async (m, { conn, usedPrefix, command }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO);
    const nomeUser = m.pushName || 'Explorador';

    // REGRA SOBERANA: Leandro sem cooldown, ADMs com 1 minuto
    if (!eDono) {
        const tempoEspera = 60 * 1000;
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000);
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para fazer outra varredura.`);
        }
        cooldowns[m.sender] = Date.now();
    }

    const extensoesPerigosas = ['.apk', '.exe', '.bat', '.scr', '.js', '.vbs', '.cmd', '.ps1', '.reg'];
    const padroesSuspeitos = [
        /bit\.ly|tinyurl\.com|mega\.nz|mediafire\.com|drive\.google\.com/i,
        /hack|crack|keygen|nitro|premium|gratis|free/i,
        /\.(apk|exe|bat|scr|js|vbs|cmd|ps1|reg)$/i
    ];

    await m.react('🔍');

    const messages = Object.values(conn.chats[m.chat]?.messages || {})
        .filter(v => {
            const text = v.message?.conversation || 
                         v.message?.extendedTextMessage?.text || 
                         v.message?.documentMessage?.fileName || 
                         '';
            
            const temExtensaoPerigosa = v.message?.documentMessage &&
                extensoesPerigosas.some(ext => v.message.documentMessage.fileName?.toLowerCase().endsWith(ext));

            const matchPadraoSuspeito = padroesSuspeitos.some(regex => regex.test(text));

            return temExtensaoPerigosa || matchPadraoSuspeito;
        })
        .sort((a, b) => b.messageTimestamp.low - a.messageTimestamp.low)
        .slice(0, 100);

    if (!messages.length) return m.reply('*🔍 Nenhuma mensagem suspeita ou vírus foi encontrado no histórico recente.*');

    await m.reply(`*🛡️ Varredura iniciada... Apagando ${messages.length} mensagens de risco.*`);

    for (let msg of messages) {
        try {
            await conn.sendMessage(m.chat, { delete: msg.key });
            await new Promise(resolve => setTimeout(resolve, 200)); // Delay suave para não dar ban
        } catch (e) {
            console.error('Erro ao deletar:', e);
        }
    }

    await m.react('✅');
    await m.reply(`*🛡️ Limpeza concluída!* Foram removidos ${messages.length} arquivos ou links que poderiam conter vírus.`);
};

handler.help = ['limparvirus'];
handler.tags = ['grupo'];
handler.command = ['borrarvirus', 'limparvirus', 'antivirus'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;