/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let uptime = await process.uptime()
    
    // Texto formatado para o Soberano
    let runtime = `*𝐆𝐨𝐭𝐢𝐜𝐚 𝐁𝐨𝐭*\n\n*✰ Tempo ativo:* ${rTime(uptime)}`.trim()
    
    // Envia com o selo do canal que configuramos no allfake
    await conn.reply(m.chat, runtime, m, global.rcanal)
}

handler.help = ['runtime']
handler.tags = ['main']
handler.command = ['runtime', 'uptime', 'atividades']

export default handler

function rTime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " dia, " : " dias, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : "";
    
    return dDisplay + hDisplay + mDisplay + sDisplay;
}