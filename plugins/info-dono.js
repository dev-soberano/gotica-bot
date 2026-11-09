/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 *
 * Perfis públicos (NÃO é owner-gated — qualquer pessoa pode usar):
 *
 *  !dono / !infodono     - perfil do CRIADOR do bot (foto, nome,
 *                          contato, redes sociais) — usa global.perfilDono
 *  !meusdados            - mostra os PRÓPRIOS dados de quem mandou o
 *                          comando (nome, número, hierarquia, jid, lid)
 *
 * O painel completo de donos (!donos) continua no main-donos.js,
 * que é owner-gated (só o soberano usa).
 */

import { getDonoSlots, isSoberano, isDono, isModerador, isVip, jidNum } from '../lib/owners.js'

/** Descobre o LID do usuário, se disponível. */
function getLid(conn, sender) {
    try {
        const store = conn?.store?.contacts?.[sender]
        if (store?.lid) return store.lid
    } catch { }
    return null
}

const handler = async (m, { conn, command }) => {
    const cmd = (command || '').toLowerCase()
    const sender = m.sender
    const senderNum = jidNum(sender)

    // ══════════════ !meusdados — dados de quem mandou o comando ══════════════
    if (cmd === 'meusdados' || cmd === 'meudados' || cmd === 'minhados' || cmd === 'identificar') {
        const nome = m.pushName || conn?.getName?.(sender) || 'Desconhecido'

        let hierarquia = '👤 usuário'
        if (isSoberano(sender)) hierarquia = '👑 soberano'
        else if (isDono(sender)) hierarquia = '🔱 dono'
        else if (isModerador(sender)) hierarquia = '🛡️ moderador'
        else if (isVip(sender)) hierarquia = '💎 vip'

        const lid = m.senderLid || getLid(conn, sender)

        let txt = `━━━━━━━  Meus dados ━━━━━━\n`
        txt += `👤 *Nome:* ${nome}\n`
        txt += `📱 *Número:* +${senderNum}\n`
        txt += `🏷️ *Hierarquia:* ${hierarquia}\n`
        txt += `🆔 *JID:* ${sender}\n`
        if (lid) txt += `🔑 *LID:* ${lid}\n`
        txt += `\n_Aqui estão os dados de identificação do WhatsApp_`

        return m.reply(txt)
    }

    // ══════════════ !dono / !infodono — perfil do criador do bot ══════════════
    if (cmd === 'dono' || cmd === 'infodono') {
        const p = global.perfilDono || {}
        const nome = p.nome || global.author || 'Dev Soberano'
        const cargo = p.cargo || 'Criador'

        let num = String(p.numero || '').replace(/\D/g, '')
        if (!num) {
            // fallback: número do soberano (slot 1) cadastrado em owners.js
            const slots = getDonoSlots()
            const soberano = slots.find(s => s.slot === 1)
            if (soberano?.definido) num = jidNum(soberano.jid)
        }
        const jidDono = num ? `${num}@s.whatsapp.net` : null

        let txt = ''
        txt += `┏╾═╼°✩•°: | ⊱👑📋⊰ | :°•✩°╾═╼┓ ┃ ✧ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖̧𝗢̃𝗘𝗦 𝗗𝗢 𝗗𝗢𝗡𝗢 ✧ ┗╾═╼°❃•°: | ⊱👑📋⊰ | :°•❃°╾═╼┛\n`
        txt += `\n`
        txt += `┇┆✦ *Nome:* ${nome}\n`
        txt += `┇┆✦ *Cargo:* ${cargo}\n`
        txt += `┇├┉━┅┅┅┅┅┅┅┅┅⋅≎⋆ᐧ\n`
        if (num) txt += `┇┆✦ *☎️ Contato:* +${num}\n`

        const redes = (p.redes || []).filter(r => r && r.link)
        for (const r of redes) {
            txt += `┇┆✦ ${r.icone || '🔗'} ${r.nome}: ${r.link}\n`
        }

        txt += `\n`
        txt += `┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆`

        try {
            await m.react('🖤')

            // Foto: a definida em global.perfilDono, senão a do WhatsApp, senão o banner.
            let foto = p.foto || null
            if (!foto && jidDono) {
                try { foto = await conn.profilePictureUrl(jidDono, 'image') } catch { }
            }
            if (!foto) foto = global.banner

            if (foto) {
                await conn.sendMessage(m.chat, {
                    image: { url: foto },
                    caption: txt,
                    mentions: [m.sender]
                }, { quoted: m })
            } else {
                await m.reply(txt)
            }
        } catch (e) {
            console.error('[DONO] Erro no perfil:', e)
            await m.reply(txt)
        }
        return
    }
}

handler.help = ['dono', 'infodono', 'meusdados']
handler.tags = ['main']
handler.command = ['dono', 'infodono', 'meusdados', 'meudados', 'minhados', 'identificar']

export default handler