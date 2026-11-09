/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗       ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣       ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩       ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { getAllOwners } from '../lib/owners.js'

let handler = async (m, { conn, usedPrefix, command, isSoberano, isOwner }) => {
    // 🛡️ Validação unificada da Cúpula da Gótica (Soberano e Donos do Painel slots 1-6)
    const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
    const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
    const isAnyOwner = isOwner || isSoberano || m?.fromMe || allOwners.includes(senderNum)

    if (!isAnyOwner) {
        await m.react('🤣')
        return m.reply(`
🫵 *QUEM VOCÊ PENSA QUE É?*

Você realmente achou que teria o mesmo poder que a alta cúpula da *GÓTICA*?\n
Não me faça rir! Esse comando é exclusivo para o Soberano e os Donos do painel. 💋⭐\n

> 🚫 *ACESSO NEGADO, VERME.*`.trim());
    }

    try {
        await m.react('🔄')
        await m.reply('*[ SISTEMA ]* ⚠️\n\nO Soberano solicitou o reinício imediato. A Gótica Bot estará de volta em instantes... 🦇')
        
        setTimeout(() => {
            // Se estiver rodando no PM2, ele reinicia lindamente sozinho
            if (process.send) {
                process.send('reset')
            } else {
                // Se estiver rodando no terminal normal, encerra para o script externo religar
                process.exit(0)
            }
        }, 2000) 
        
    } catch (error) {
        console.log(error)
        m.reply(`*Erro ao reiniciar:* ${error}`)
    }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar', 'resetbot'] 

export default handler