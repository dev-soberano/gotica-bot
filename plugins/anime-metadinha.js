/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from "node-fetch"

let handler = async (m, { conn }) => {
    // Busca o banco de dados de metadinhas
    let res = await fetch('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json')
    if (!res.ok) throw 'Erro ao carregar o banco de dados.'
    
    let data = await res.json()
    let cita = data[Math.floor(Math.random() * data.length)]
    
    await m.react('💖')

    // Envia a foto masculina
    let cowi = await (await fetch(cita.cowo)).buffer()
    await conn.sendFile(m.chat, cowi, 'ppcp.jpg', '*Masculino* ♂️', m)
    
    // Envia a foto feminina
    let ciwi = await (await fetch(cita.cewe)).buffer()
    await conn.sendFile(m.chat, ciwi, 'ppcp.jpg', '*Feminina* ♀️', m)
}

handler.help = ['ppcouple', 'ppcp']
handler.tags = ['anime']
handler.command = ['ppcp', 'ppcouple', 'metadinha', 'metadinhas']
handler.group = true

// Cooldown zero para o Soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000)

// Para que serve: Envia duas imagens que se completam (metadinhas) para perfil.
// Benefícios: Ótimo para casais ou melhores amigos usarem fotos combinando.
// Acesso: Todos os membros.

export default handler