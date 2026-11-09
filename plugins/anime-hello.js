/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    
    await m.react('👋');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* diz *olá* para *${name}*, como você está?`;
    } else {
        str = `*${name2}* está cumprimentando todos do grupo! Como vocês estão?`.trim();
    }
    
    // Seus novos links do Litterbox - 100% funcionais
    const videos = [
        'https://files.catbox.moe/vut21r.mp4',
        'https://files.catbox.moe/1hd6gb.mp4'
    ];
    
    const video = videos[Math.floor(Math.random() * videos.length)];

    try {
        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions: [who] 
        }, { quoted: m });
    } catch (e) {
        console.error('Erro ao enviar vídeo:', e.message);
        // Fallback rápido se der erro na rede
        await m.react('❌');
    }
}

handler.help = ['ola'];
handler.tags = ['anime'];
handler.command = ['hello', 'hola', 'ola', 'oi'];
handler.group = true;

// Cooldown zero para o Soberano Leandro
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia saudações em vídeo.
// Benefícios: Interação rápida e visual com links estáveis.
// Acesso: Todos os membros.

export default handler;