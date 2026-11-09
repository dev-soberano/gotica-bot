/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, participants, groupMetadata }) => {
    // Busca a foto do grupo ou usa a imagem padrão da Gótica
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || 'https://files.catbox.moe/yyk5xo.jpg';
    
    // Puxa as configurações do banco de dados
    const { antiLink, detect, welcome, modoadmin, antiPrivate, autoRechazar, nsfw, autoAceptar, restrict, antiSpam, reaction, antiviewonce, antiTraba, antiToxic } = global.db.data.chats[m.chat];
    
    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

    const text = `*🦇 ─ ☾ INFO DO GRUPO ☽ ─ 🦇*

*❀ ID:*
→ ${groupMetadata.id}

*⚘ Nome:*
→ ${groupMetadata.subject}

*❖ Membros:*
→ ${participants.length} Participantes

*✰ Criador:*
→ @${owner.split('@')[0]}

*✥ Administradores:*
${listAdmin}

*🦇 ─ ☾ CONFIGURAÇÕES ☽ ─ 🦇*

◈ *Boas-vindas:* ${welcome ? '✅' : '❌'}
◈ *Detectar:* ${detect ? '✅' : '❌'}  
◈ *Anti-Link:* ${antiLink ? '✅' : '❌'} 
◈ *Auto-Aceitar:* ${autoAceptar ? '✅' : '❌'} 
◈ *Auto-Rejeitar:* ${autoRechazar ? '✅' : '❌'} 
◈ *NSFW (18+):* ${nsfw ? '✅' : '❌'} 
◈ *Anti-Privado:* ${antiPrivate ? '✅' : '❌'} 
◈ *Apenas Admins:* ${modoadmin ? '✅' : '❌'} 
◈ *Anti-Visualização Única:* ${antiviewonce ? '✅' : '❌'} 
◈ *Reações:* ${reaction ? "✅" : "❌"}
◈ *Anti-Spam:* ${antiSpam ? '✅' : '❌'} 
◈ *Restrição:* ${restrict ? '✅' : '❌'} 
◈ *Anti-Tóxico:* ${antiToxic ? '✅' : '❌'} 
◈ *Anti-Trava:* ${antiTraba ? '✅' : '❌'} 
`.trim();

    conn.sendFile(m.chat, pp, 'info.jpg', text, m, false, { mentions: [...groupAdmins.map((v) => v.id), owner] });
};

handler.help = ['infogrupo'];
handler.tags = ['grupo'];
handler.command = ['infogrupo', 'dadosgp', 'infogp'];
handler.register = false; 
handler.group = true;

export default handler;