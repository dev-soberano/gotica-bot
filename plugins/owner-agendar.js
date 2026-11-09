/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, participants, text, usedPrefix, command }) => {
    // Lista todos os usuários para marcar, removendo o bot da lista
    let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)

    // Explicação detalhada caso o usuário erre o comando
    let exemplo = `*❌ FORMATO INCORRETO!*
    
*Siga o exemplo abaixo:*
👉 \`${usedPrefix + command} Sua mensagem aqui . 10m\`

*Entenda os sufixos de tempo:*
✅ *s* = segundos (ex: 30s)
✅ *m* = minutos (ex: 10m)
✅ *h* = horas (ex: 2h)
✅ *d* = dias (ex: 1d)

*⚠️ Não esqueça do PONTO ( . ) entre a mensagem e o tempo!*`

    if (!text) return m.reply(exemplo)

    // Divide o texto e o tempo pelo ponto "."
    let [msg, tempoStr] = text.split('.')
    if (!tempoStr) return m.reply(exemplo)

    msg = msg.trim()
    tempoStr = tempoStr.trim().toLowerCase()

    // Lógica para converter o tempo em milissegundos
    let ms = 0
    let valor = parseInt(tempoStr)
    
    if (isNaN(valor)) return m.reply(exemplo)

    if (tempoStr.endsWith('s')) ms = valor * 1000
    else if (tempoStr.endsWith('m')) ms = valor * 60000
    else if (tempoStr.endsWith('h')) ms = valor * 3600000
    else if (tempoStr.endsWith('d')) ms = valor * 86400000
    else return m.reply(exemplo)

    m.reply(`*⏳ Agendamento realizado com sucesso!*
    
*Mensagem:* ${msg}
*Disparo em:* ${tempoStr}
*Aviso:* Todos os membros serão marcados.`)

    function espera() {
        conn.reply(m.chat, msg, null, { mentions: users })
    }

    setTimeout(espera, ms)
}

handler.help = ['agendar <texto> . <tempo>']
handler.tags = ['group', 'admin']
handler.command = ['agendar', 'agenda']

handler.group = true 
handler.admin = true // Agora permitido para ADMS e para o Soberano

export default handler