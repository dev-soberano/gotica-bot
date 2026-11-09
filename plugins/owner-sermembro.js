/**
 * 👑 COMANDO SER-MEMBRO - EXCLUSIVO PARA A CÚPULA DA GÓTICA
 * Sistema de Rebaixamento Voluntário: Remove os privilégios de admin do dono.
 * @author ༄ Đev Šoberano ×͜×
 */

import { getAllOwners } from '../lib/owners.js'

const handler = async (m, { conn, isAdmin, isBotAdmin, isSoberano, isOwner }) => {
    // Validação inteligente e segura compatível com o sistema de @lid e donos extras
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

    // Se NÃO for admin, não tem o que rebaixar
    if (!isAdmin) {
        return m.reply('*⚠️ Você já é um membro comum no grupo!*')
    }

    // Verifica se o BOT é admin para ter permissão de rebaixar
    if (!isBotAdmin) {
        return m.reply('*❌ Erro:* Eu preciso ser administrador do grupo para poder alterar seu cargo!')
    }

    try {
        // Rebaixa diretamente o remetente da mensagem
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'demote')
        await m.react('🫡')
        
        await m.reply('🫡 *CARGO ALTERADO!* \n\n> Você agora está disfarçado entre os membros comuns.')

    } catch (e) {
        console.error('[ERRO SER-MEMBRO]:', e)
        m.reply('> *💥 Ocorreu um erro ao tentar te rebaixar. Verifique se eu tenho cargo de administrador neste grupo!*')
    }
}

handler.help = ['sermembro']
handler.tags = ['owner']
handler.command = ['sermembro', 'virarmembro', 'tiraradm']
handler.group = true 
handler.botAdmin = true 

export default handler