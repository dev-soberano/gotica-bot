/**
 * 👑 COMANDO AUTO-ADMIN - EXCLUSIVO PARA A CÚPULA DA GÓTICA
 * Sistema de Defesa: Soberano e Donos do Painel (slots 1-6).
 * @author ༄ Đev Šoberano ×͜×
 */

import { getAllOwners } from '../lib/owners.js'

const handler = async (m, { conn, isAdmin, isBotAdmin, isSoberano, isOwner }) => {
    // isOwner/isSoberano já vêm tratados pelo handler.js com a resolução de @lid correta.
    // Fazemos um fallback cruzado com getAllOwners para máxima segurança.
    const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
    const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
    const isAnyOwner = isOwner || isSoberano || allOwners.includes(senderNum) || m?.fromMe

    // 🔒 TRAVA DE SEGURANÇA E DEBOCHE AGRESSIVO
    if (!isAnyOwner) {
        await m.react('🤣')
        return m.reply(`
🫵 *QUEM VOCÊ PENSA QUE É?*

Você realmente achou que teria o mesmo poder que a alta cúpula da *GÓTICA*?\n
Não me faça rir! Esse comando é exclusivo para o Soberano e os Donos do painel. 💋⭐\n

> 🚫 *ACESSO NEGADO, VERME.*`.trim());
    }

    // Se já for admin
    if (isAdmin) {
        return m.reply('*⚠️ Você já é o administrador. O comando é seu!*')
    }

    // Verifica se o BOT é admin antes de tentar dar a promoção
    if (!isBotAdmin) {
        return m.reply('*❌ Erro:* Eu preciso ser administrador do grupo primeiro para poder te dar o cargo!')
    }

    try {
        // Promove diretamente o remetente da mensagem
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
        await m.react('👑')
        
        await m.reply('👑 *PODER CONCEDIDO! Cargo assumido com sucesso.*\n\n> Você agora é admin do grupo!')

    } catch (e) {
        console.error('[ERRO AUTO-ADMIN]:', e)
        m.reply('*💥 Ocorreu um erro ao tentar te promover. Verifique se eu tenho cargo de administrador neste grupo!*')
    }
}

handler.help = ['autoadmin']
handler.tags = ['owner']
handler.command = ['seradm', 'viraradm', 'meadm']
handler.group = true 
handler.botAdmin = true 

export default handler