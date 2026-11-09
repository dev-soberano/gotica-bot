/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

export async function all(m) {
    global.db.data.msgs = global.db.data.msgs || {}
    let msgs = global.db.data.msgs

    // Filtros de segurança básicos
    if (!m.chat || m.fromMe || m.isBaileys || !m.text) return
    if (m.key.remoteJid.endsWith('status@broadcast')) return

    // Verifica se o texto enviado é um gatilho salvo
    if (!(m.text in msgs)) return

    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    if (chat?.isned || user?.ned) return

    // Reconstrói a mensagem do co de dados (JSON -> Buffer)
    let _m = this.serializeM(JSON.parse(JSON.stringify(msgs[m.text]), (_, v) => {
        if (v !== null && typeof v === 'object' && v.type === 'Buffer' && Array.isArray(v.data)) {
            return Buffer.from(v.data)
        }
        return v
    }))

    // Envia a mensagem salva
    await this.copyNForward(m.chat, _m, true)
}