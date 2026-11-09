/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { sticker } from '../lib/sticker.js';

let cooldowns = {};
const TARGET_JID_DONO = '240041947357401@lid'; 
const DONO_PHONE = '556391330669';

const handler = async (m, { conn, args }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO);
    
    // REGRA SOBERANA: Sem tempo para o Leandro
    if (!eDono) {
        const tempoEspera = 60 * 1000;
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            return m.reply(`*⚠️ AGUARDE:* Aguarde 1 minuto.`);
        }
        cooldowns[m.sender] = Date.now();
    }

    let text;
    if (args.length >= 1) {
        text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        return m.reply(`*📌 Faltou o texto!*`);
    }

    try {
        const name = await conn.getName(m.quoted ? m.quoted.sender : m.sender);
        // Usando API de renderização de texto limpa para evitar arquivos corrompidos
        const textFormatted = encodeURIComponent(`"${text}"\n\n- ${name}`);
        const url = `https://chart.googleapis.com/chart?cht=p3&chco=000000&chs=512x512&chld=L|0&cht=tx&chl=${textFormatted}`;
        
        // Tentativa de gerar a figurinha
        let stiker = await sticker(false, url, global.packsticker || 'Gotica Bot', 'Dev Soberano');
        
        if (stiker && stiker.length > 0) {
            return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
        } else {
            // Se falhar a figurinha, envia como imagem para não dar erro de 0KB
            return conn.sendFile(m.chat, url, 'image.png', `*👤 Citação de:* ${name}\n\n${text}`, m);
        }
    } catch (e) {
        return m.reply(`*❌ ERRO:* Não foi possível processar o sticker agora.`);
    }
};

handler.help = ['qc'];
handler.tags = ['sticker'];
handler.command = ['qc', 'citacao'];
handler.group = true;

export default handler;