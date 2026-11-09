/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, command }) => {
    await m.react('📊')

    if (command == 'dash' || command == 'dashboard' || command == 'views') {
        let stats = Object.entries(global.db.data.stats).map(([key, val]) => {
            let name = Array.isArray(global.plugins[key]?.help) ? global.plugins[key]?.help?.join(' , ') : global.plugins[key]?.help || key 

            if (/exec/.test(name)) return
            return { name, ...val }
        }).filter(v => v) // Remove nulos

        stats = stats.sort((a, b) => b.total - a.total)
        
        let txt = `📊 *ESTATÍSTICAS DE USO*\n_Os 10 comandos mais usados na Gótica Bot_ 💋\n\n`
        
        txt += stats.slice(0, 10).map(({ name, total }, i) => {
            return `*${i + 1}.* ✨ *Comando:* ${name}\n   *Usos:* ${total}`
        }).join('\n\n')

        await conn.reply(m.chat, txt, m)
    }

    if (command == 'database' || command == 'usuarios' || command == 'user') {
        let totalreg = Object.keys(global.db.data.users).length
        // Filtra quem está registrado no banco de dados
        let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length

        await conn.reply(m.chat, `
📂 *STATUS DO BANCO DE DADOS*

⭐ *Usuarios Registrados:* ${rtotalreg}
💫 *Total de Usuários no Banco:* ${totalreg}

_A Gótica Bot está dominando tudo!_ 💋`, m)
    }
}

handler.help = ['dash', 'dashboard', 'views', 'database', 'usuarios', 'user']
handler.tags = ['info']
handler.command = ['dashboard', 'dash', 'views', 'database', 'usuarios', 'user']
handler.register = false // Removida a trava de registro como solicitado

export default handler