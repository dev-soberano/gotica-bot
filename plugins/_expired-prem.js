/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = (m) => m;

export async function all(m) {
  for (const user of Object.values(global.db.data.users)) {
    if (user.premiumTime != 0 && user.premium) {
      if (new Date() * 1 >= user.premiumTime) {
        user.premiumTime = 0;
        user.premium = false;
        
        const JID = Object.keys(global.db.data.users).find((key) => global.db.data.users[key] === user);
        const usuarioJid = JID.split`@`[0];
        
        // Mensagem de perda com CTA para o seu PV
        const textoo = `*「 ⚠️ ACESSO REVOGADO 」*\n\n*O brilho se apagou...* 🥀\n\n@${usuarioJid}, sua assinatura *Premium* expirou e todos os seus privilégios foram removidos agora mesmo.\n\n*Quer recuperar seus poderes?*\nEntre em contato direto com o *Soberano Leandro* para renovar:\n*wa.me/${this.user.jid.split('@')[0]}*\n\nNão perca tempo, ou ficará para trás! ⚡`;
        
        await this.sendMessage(JID, { text: textoo, mentions: [JID] }, { quoted: m });
      }
    }
  }
}

export default handler