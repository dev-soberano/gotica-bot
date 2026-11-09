/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch';

// Chave API (AIza...) - Usando a 1.5 para evitar erro de cota zero
const GEMINI_API_KEY = "AIzaSyDM0a9Foc8HFE4gAFS-iZ3FluqqywzBr5g"; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let handler = async (m, { text, usedPrefix, command, conn }) => {
    // Para que serve: IA para responder perguntas e conversas.
    // Como usar: .ia2 Qual a capital da França?
    // Público: Todos os usuários. Sem trava de registro.

    if (!text) return conn.reply(m.chat, `*┇┆🔍 O que você deseja saber?*\n\nExemplo: *${usedPrefix + command} Como aprender programação?*`, m);

    try {
        await m.react('🧠');
        await conn.sendPresenceUpdate('composing', m.chat);

        let response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: text }]
                }]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Erro na API');
        }

        let aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) return conn.reply(m.chat, `*┇┆❌ Erro:* Não foi possível gerar uma resposta agora.`, m);

        await conn.sendMessage(m.chat, { 
            text: `*✦ Gótica IA ✦*\n\n${aiText}\n\n*✧ Dev: Leandro Rocha*` 
        }, { quoted: m });

        await m.react('✅');

    } catch (err) {
        console.error('Erro no Gemini:', err.message);
        await m.react('❌');
        
        // Mensagem genérica para não expor erros técnicos aos usuários
        await conn.reply(m.chat, `*┇┆⚠️ Erro:* O sistema está com muita demanda. Tente novamente em alguns segundos.`, m);
    }
};

handler.help = ['ia2'];
handler.command = ['ia2', 'gemini', 'chat'];
handler.tags = ['ai'];
handler.register = false; 

export default handler;