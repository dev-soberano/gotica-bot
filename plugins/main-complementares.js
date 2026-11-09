/**
 * @project Gótica Bot - Comandos Complementares
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 *
 * Comandos avulsos que não pertencem a nenhuma categoria de menu:
 *  !rpg          - visão geral do RPG
 *  !vozes        - lista efeitos de voz
 *  !personagem   - sorteia um personagem de anime
 *  !gerar        - (dono) adiciona coins
 *  !confiscar    - (dono) remove coins
 */

import { formatNumber } from '../lib/helpers-minato.js'
import { getAllOwners } from '../lib/owners.js'

const handler = async (m, { conn, args, command, text, usedPrefix: _p, isSoberano, isOwner, participants }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ !rpg - overview do RPG ══════════════
    if (cmd === 'rpg') {
        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🎮 *SISTEMA RPG*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `┌───────────────────────┐\n`
        txt += `│ 📊 *Level/XP:* !level !nivel !ranklevel\n`
        txt += `│ 💰 *Economia:* !trabalhar !apostar !loja\n`
        txt += `│ 🏙️ *Cidade:* !registrarcidade !perfilcidade\n`
        txt += `│ 🏷️ *Tags:* !addtag !rank<tag>\n`
        txt += `│ 🎁 *Cofre:* !cofre !resgatar\n`
        txt += `│ 📦 *Inventário:* !inventario !loja\n`
        txt += `└───────────────────────┘`
        return m.reply(txt)
    }

    // ══════════════ !vozes - lista efeitos de voz ══════════════
    if (cmd === 'vozes' || cmd === 'efeitosvoz' || cmd === 'listvozes') {
        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🎙️ *EFEITOS DE VOZ*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        const efeitos = [
            ['bass', 'Grave'], ['blown', 'Estourado'], ['deep', 'Profundo'],
            ['earrape', 'Dor de ouvido'], ['fast', 'Rápido'], ['fat', 'Gorducho'],
            ['nightcore', 'Nightcore'], ['reverse', 'Reverso'], ['robot', 'Robô'],
            ['slow', 'Lento'], ['smooth', 'Suave'], ['tupai', 'Tupi'],
            ['bass2', 'Grave 2'], ['bass3', 'Grave 3'], ['slowed', 'Slowed'],
            ['speedup', 'Speed up']
        ]
        efeitos.forEach(([cmdName, nome], i) => {
            txt += `• \`!${cmdName}\` — ${nome}\n`
        })
        txt += `\n┌───────────────────────┐\n`
        txt += `│ *ENVIE OU RESPONDA A UM*\n`
        txt += `│ *ÁUDIO PARA APLICAR.*\n`
        txt += `└───────────────────────┘`
        return m.reply(txt)
    }

    // ══════════════ !personagem - sorteia personagem de anime ══════════════
    if (cmd === 'personagem' || cmd === 'personagens' || cmd === 'char' || cmd === 'character') {
        const personagens = [
            { nome: 'Naruto Uzumaki', anime: 'Naruto', poder: 'Chakra' },
            { nome: 'Monkey D. Luffy', anime: 'One Piece', poder: 'Gomu Gomu no Mi' },
            { nome: 'Saitama', anime: 'One Punch Man', poder: 'Seriedade' },
            { nome: 'Ichigo Kurosaki', anime: 'Bleach', poder: 'Espada Espiritual' },
            { nome: 'Goku', anime: 'Dragon Ball', poder: 'Ki' },
            { nome: 'Levi Ackerman', anime: 'Attack on Titan', poder: 'Manobra Gear' },
            { nome: 'Itachi Uchiha', anime: 'Naruto', poder: 'Mangekyo Sharingan' },
            { nome: 'Vegeta', anime: 'Dragon Ball', poder: 'Ki' },
            { nome: 'Tanjiro Kamado', anime: 'Demon Slayer', poder: 'Respiração da Água' },
            { nome: 'Zoro', anime: 'One Piece', poder: 'Santoryu' },
            { nome: 'Guts', anime: 'Berserk', poder: 'Lâminas' },
            { nome: 'Deku', anime: 'My Hero Academia', poder: 'One For All' }
        ]
        const p = personagens[Math.floor(Math.random() * personagens.length)]
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━━╮\n  🎭 *PERSONAGEM SORTEADO*\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👤 *${p.nome}*\n📺 *Anime:* ${p.anime}\n⚡ *Poder:* ${p.poder}`)
    }

    // ══════════════ !gerar / !dardinheiro - (dono) adiciona coins ══════════════
    if (cmd === 'addcoins' || cmd === 'addmoney' || cmd === 'gerar' || cmd === 'dardinheiro') {
        if (!m.isGroup) return m.reply(global.dfail('group'))

        const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
        const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
        const isAnyOwner = isOwner || isSoberano || allOwners.includes(senderNum) || m?.fromMe

        if (!isAnyOwner) {
            await m.react('🤣')
            return m.reply(`
🫵 *QUEM VOCÊ PENSA QUE É?*

Você realmente achou que teria o mesmo poder que a alta cúpula da *GÓTICA*?\n
Não me faça rir! Esse comando é exclusivo para o Soberano e os Donos do painel. 💋⭐\n

> 🚫 *ACESSO NEGADO, VERME.*`.trim());
        }

        let chat = global.db.data.chats[m.chat]
        if (!chat) chat = global.db.data.chats[m.chat] = {}
        if (!chat.users) chat.users = {}

        let who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
            ? m.quoted.sender 
            : (args.length >= 2 || (args.length === 1 && isNaN(args[0])) 
                ? (args[0].includes('@') ? args[0] : `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`) 
                : m.sender)

        let valor = 0
        if (args.length >= 2) {
            valor = parseInt(args[1])
        } else if (args.length === 1 && !isNaN(args[0])) {
            valor = parseInt(args[0])
        }

        if (isNaN(valor) || valor <= 0) {
            return m.reply('📝 *Uso:*\n!gerar 1000 (para você mesmo)\n!gerar 1000 @membro')
        }

        let primaryJid = who; 
        if (who.endsWith('@lid') && m.isGroup && participants) {
            const participantInfo = participants.find(p => p.lid === who);
            if (participantInfo && participantInfo.id) { 
                primaryJid = participantInfo.id;
            }
        }

        if (!chat.users[primaryJid]) {
            chat.users[primaryJid] = { coin: 0, bank: 0, lastworking: 0, lasttrafico: 0 }
        }

        chat.users[primaryJid].coin += valor

        let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
        let nombre = 'Membro'
        try {
            nombre = await conn.getName(primaryJid) || 'Membro'
        } catch {
            nombre = 'Membro'
        }

        let texto = `
┏━━⏤͟͟͞͞★꙲⃝͟👑 *PODER DO DONO*
┃
┃ 💰 *Valor Adicionado:* ${formatarReal(valor)}
┃ 🎯 *Destinatário:* ${nombre}
┃ 📈 *Novo Saldo (Carteira):* ${formatarReal(chat.users[primaryJid].coin)}
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟✨🔑━━━━┛`.trim()

        await m.react('💸')
        return conn.reply(m.chat, texto, m, { mentions: [primaryJid] })
    }

    // ══════════════ !confiscar / !tirardinheiro - (dono) remove coins ══════════════
    if (cmd === 'confiscar' || cmd === 'tirardinheiro' || cmd === 'removergrana') {
        if (!m.isGroup) return m.reply(global.dfail('group'))

        const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
        const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
        const isAnyOwner = isOwner || isSoberano || allOwners.includes(senderNum) || m?.fromMe

        if (!isAnyOwner) {
            await m.react('🤣')
            return m.reply(`
🫵 *QUEM VOCÊ PENSA QUE É?*

Você realmente achou que teria o mesmo poder que a alta cúpula da *GÓTICA*?\n
Não me faça rir! Esse comando é exclusivo para o Soberano e os Donos do painel. 💋⭐\n

> 🚫 *ACESSO NEGADO, VERME.*`.trim());
        }

        let chat = global.db.data.chats[m.chat]
        if (!chat) chat = global.db.data.chats[m.chat] = {}
        if (!chat.users) chat.users = {}

        let who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
            ? m.quoted.sender 
            : (args.length >= 2 || (args.length === 1 && isNaN(args[0])) 
                ? (args[0].includes('@') ? args[0] : `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`) 
                : m.sender)

        let valor = 0
        if (args.length >= 2) {
            valor = parseInt(args[1])
        } else if (args.length === 1 && !isNaN(args[0])) {
            valor = parseInt(args[0])
        }

        if (isNaN(valor) || valor <= 0) {
            return m.reply('📝 *Uso:*\n!confiscar 100 (de você mesmo)\n!confiscar 100 @membro')
        }

        let primaryJid = who; 
        if (who.endsWith('@lid') && m.isGroup && participants) {
            const participantInfo = participants.find(p => p.lid === who);
            if (participantInfo && participantInfo.id) { 
                primaryJid = participantInfo.id;
            }
        }

        if (!chat.users[primaryJid]) {
            chat.users[primaryJid] = { coin: 0, bank: 0, lastworking: 0, lasttrafico: 0 }
        }

        if (chat.users[primaryJid].coin < valor) {
            chat.users[primaryJid].coin = 0 
        } else {
            chat.users[primaryJid].coin -= valor
        }

        let formatarReal = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
        let nombre = 'Membro'
        try {
            nombre = await conn.getName(primaryJid) || 'Membro'
        } catch {
            nombre = 'Membro'
        }

        let texto = `
┏━━⏤͟͟͞͞★꙲⃝͟📉 *CONFISCO REAL*
┃
┃ 📉 *Valor Removido:* ${formatarReal(valor)}
┃ 🎯 *Alvo:* ${nombre}
┃ 📉 *Saldo Restante (Carteira):* ${formatarReal(chat.users[primaryJid].coin)}
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟💸❈🔐━━━━┛`.trim()

        await m.react('📉')
        return conn.reply(m.chat, texto, m, { mentions: [primaryJid] })
    }
}

handler.help = ['rpg', 'personagem', 'addcoins', 'confiscar']
handler.tags = ['main', 'rpg']
handler.command = [
    'rpg', 'efeitosvoz', 'listvozes',
    'personagem', 'personagens', 'char', 'character',
    'addcoins', 'addmoney', 'gerar', 'dardinheiro',
    'tirardinheiro', 'removergrana', 'confiscar'
]

export default handler