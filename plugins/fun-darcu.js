/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, participants, groupMetadata }) => {
    try {
        // ✅ REAÇÃO: Iniciando o sorteio
        await m.react('🍑')

        // 1. Extrair apenas os IDs dos participantes (filtrando IDs inválidos)
        const membros = participants
            .map((m) => m.id)
            .filter((id) => id.includes("@s.whatsapp.net") || id.includes("@lid"));

        // 2. Checagem de segurança
        if (membros.length === 0) {
            return m.reply("❌ Não consegui encontrar membros para o sorteio.")
        }

        // 3. Sorteia um membro aleatório
        const sortudo = membros[Math.floor(Math.random() * membros.length)];
        const sortudoNumero = sortudo.split("@")[0];

        const responseText = `🎉 *ATENÇÃO GALERA!* 🎉\n\nO sortudo ou a sortuda de hoje que vai dar o cu é o(a): *@${sortudoNumero}*! 🍑🔥`;

        // 4. Envia com a menção
        await conn.sendMessage(m.chat, { 
            text: responseText, 
            mentions: [sortudo] 
        }, { quoted: m })

    } catch (error) {
        console.error("Erro no comando darcu:", error);
        return m.reply("❌ Ocorreu um erro ao sortear o membro.")
    }
}

handler.help = ['darcu']
handler.tags = ['fun']
handler.command = ['darcu', 'sortearcu']
handler.group = true // Comando exclusivo para grupos

export default handler