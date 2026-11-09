/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch';

export async function before(m, { conn }) {
    // --- [ AJUSTE DE PREFIXO RESTRITO ] --- 💋
    // O bot agora ignora qualquer símbolo que não seja o do seu settings.js
    let pref = global.prefix || '!'
    const escapedPrefix = pref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const prefixRegex = new RegExp(`^${escapedPrefix}`)

    if (!m.text || !prefixRegex.test(m.text)) return;

    let usedPrefix = pref
    // ----------------------------------------------

    const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

    // --- [ EXCEÇÃO PARA COMANDOS DO HANDLER ] --- 👑
    // Adicione aqui outros comandos que você colocar direto no handler.js
    const comandosHandler = ['nuke']; 
    if (comandosHandler.includes(command)) return; 
    // ----------------------------------------------

    // Função de validação protegida contra valores nulos
    const validCommand = (command, plugins) => {
        for (let plugin of Object.values(plugins || {})) {
            if (plugin && plugin.command) {
                const commandList = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                if (commandList.some(cmd => 
                    cmd instanceof RegExp ? cmd.test(command) : cmd === command
                )) {
                    return true;
                }
            }
        }
        return false;
    };

    if (!command || command === "bot") return;

    if (validCommand(command, global.plugins)) {
        let chat = global.db.data.chats[m.chat];
        let user = global.db.data.users[m.sender];

        // Verifica se o bot está desativado no grupo (apenas para membros comuns)
        if (chat && chat.isBanned && !m.fromMe && !m.isOwner) {
            const avisoDesativado = `*「 ⚠️ AVISO 」*\n\nA bot *${global.botname}* está desativada neste grupo.\n\n> ✦ Um *administrador* pode ativá-la com:\n> » *${usedPrefix}bot on*`;
            await m.reply(avisoDesativado);
            return;
        }

        if (user) {
            if (!user.commands) user.commands = 0;
            user.commands += 1;
        }

    } else {
        // Bloco para comandos não encontrados
        let fkontak = null;
        try {
            const res = await fetch('https://files.catbox.moe/agyn6l.jpeg');
            if (res.ok) {
                const thumb2 = Buffer.from(await res.arrayBuffer());
                fkontak = {
                    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
                    message: {
                        locationMessage: {
                            name: `Comando não encontrado`,
                            jpegThumbnail: thumb2
                        }
                    },
                    participant: '0@s.whatsapp.net'
                };
            }
        } catch (e) { }

        const comandoErrado = m.text.trim().split(' ')[0];

        const msjDecorado = `(,,•᷄‎ࡇ•᷅ ,,)? O comando *${comandoErrado}* não está registrado ou foi escrito incorretamente.\n\nPara ver a lista de funções, use:\n» *${usedPrefix}menu*`;

        // Se for você ou ADM, ele avisa.
        if (fkontak) {
            await conn.sendMessage(m.chat, { text: msjDecorado }, { quoted: fkontak });
        } else {
            await m.reply(msjDecorado);
        }
    }
}