/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    // Pegando uma imagem aleatória da sua lista da Catbox
    let img = 'https://files.catbox.moe/ob7j4s.jpeg'
    
    let staff = `ᥫ᭡ *EQUIPE OFICIAL GOTICA BOT* ❀

*✰ Desenvolvedor* » Dev Soberano
*✦ Cargo* » O Chefe de tudo.
> ✧ GitHub: https://github.com/leandromemes

*✰ IA* » Gemini (Google)
*✦ Cargo* » assistente 24h.
> ✧ Status: Online e processando...

*✰ Informações do Projeto*
*⚘ Versão:* 2.0.0 (MD)

*❖ Suporte:* ${global.creador}
`
    await conn.sendMessage(m.chat, { 
        image: { url: img }, 
        caption: staff.trim(),
        contextInfo: global.rcanal.contextInfo
    }, { quoted: m })
}
  
handler.help = ['staff']
handler.command = ['colaboradores', 'staff', 'equipe']
handler.tags = ['main']

export default handler