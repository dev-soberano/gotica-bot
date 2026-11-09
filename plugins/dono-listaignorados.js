/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix }) => {
    let settings = global.db.data.settings[conn.user.jid]
    let ignorados = settings.ignoredUsers || []

    if (ignorados.length === 0) {
        return m.reply('*✅ Soberano, não há ninguém sendo ignorado em silêncio no momento.*')
    }

    let texto = `*🖤 LISTA DE UTILIZADORES IGNORADOS (SILENCIADOS) 🖤*\n\n`
    
    // --- [ FRASE DO MOTIVO ADICIONADA ] --- 💋
    texto += `*⚠️ MOTIVO DO SILÊNCIO:* O flood de comandos (mais de 3 em 3 segundos) sobrecarrega o sistema, trava a database e causa lag para todos. Quem floda entra na geladeira! 🧊\n\n`
    
    texto += `*Total de castigados:* ${ignorados.length}\n\n`
    
    for (let i = 0; i < ignorados.length; i++) {
        let jid = ignorados[i]
        let nome = conn.getName(jid) || 'Infiel'
        texto += `*${i + 1}.* @${jid.split('@')[0]} (${nome})\n`
    }

    texto += `\n*✨ Para perdoar e dar voz novamente, use:* ${usedPrefix}avisar @tag`

    await conn.reply(m.chat, texto, m, { mentions: ignorados })
}

handler.help = ['listaignorados']
handler.tags = ['owner']
handler.command = ['listaignorados', 'ignorados', 'silenciados']
handler.owner = true 

export default handler