/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, isOwner }) => {
    // Filtra usuários que possuem advertências no banco de dados
    let adv = Object.entries(global.db.data.users).filter(user => user[1].warn > 0)
    
    let caption = `⭐ *USUÁRIOS ADVERTIDOS* ⭐\n`
    caption += `*╭•·–––––––––––––––––––·•*\n`
    caption += `│ *Total : ${adv.length} Insetos na mira*\n`
    
    if (adv.length === 0) {
        caption += `│\n│ *Ninguém foi advertido ainda.* 💋\n`
    } else {
        caption += adv.map(([jid, user], i) => {
            return `│\n│ *${i + 1}.* ${conn.getName(jid) || 'Usuário Desconhecido'} *(${user.warn}/3)*\n│ @${jid.split`@`[0]}\n│ - - - - - - - - -`
        }).join('\n')
    }
    
    caption += `\n*╰•·–––––––––––––––––––·•*\n\n`
    caption += `*Lembre-se: Com 3 advertências o banimento é automático!* `

    await conn.reply(m.chat, caption, m, { 
        mentions: adv.map(v => v[0]) 
    })
}

handler.help = ['listawarns']
handler.tags = ['admin']
handler.command = ['listadv', 'listaadv', 'listwarns', 'listawarns', 'advertidos'] // Português
handler.group = true
handler.admin = true
handler.register = false 

export default handler