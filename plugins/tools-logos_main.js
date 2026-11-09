/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    
    let menuLogos = `✨ *CENTRAL DE LOGOS* ✨
─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🎨❈┉━━━━─

Escolha um dos estilos abaixo para criar seu logo personalizado.
Para usar, digite o comando desejado seguido do seu texto.

*📌 Exemplo:* *${usedPrefix}logoneon* Seu Texto

*🎭 ESTILOS DISPONÍVEIS:*
ი ̯ ✦⋆͜͡҈➳ logocorazon
ი ̯ ✦⋆͜͡҈➳ logoglitch
ი ̯ ✦⋆͜͡҈➳ logoneon
ი ̯ ✦⋆͜͡҈➳ logofuturista
ი ̯ ✦⋆͜͡҈➳ logograffiti3d
ი ̯ ✦⋆͜͡҈➳ logomatrix
ი ̯ ✦⋆͜͡҈➳ logohorror
ი ̯ ✦⋆͜͡҈➳ logonube
ი ̯ ✦⋆͜͡҈➳ logocielo
ი ̯ ✦⋆͜͡҈➳ logosad
ი ̯ ✦⋆͜͡҈➳ logoangel

*🎮 GAMING & PERSONAGENS:*
ი ̯ ✦⋆͜͡҈➳ logogaming
ი ̯ ✦⋆͜͡҈➳ logonaruto
ი ̯ ✦⋆͜͡҈➳ logodragonball
ი ̯ ✦⋆͜͡҈➳ logochicagamer
ი ̯ ✦⋆͜͡҈➳ logopubg / logopubgfem
ი ̯ ✦⋆͜͡҈➳ logolol
ი ̯ ✦⋆͜͡҈➳ logoamongus

*📺 INTROS EM VÍDEO:*
ი ̯ ✦⋆͜͡҈➳ logovideopubg
ი ̯ ✦⋆͜͡҈➳ logovideotiger
ი ̯ ✦⋆͜͡҈➳ logovideointro
ი ̯ ✦⋆͜͡҈➳ logovideogaming

*📱 BANNERS/PORTADAS:*
ი ̯ ✦⋆͜͡҈➳ logoportadaff
ი ̯ ✦⋆͜͡҈➳ logoportadapubg
ი ̯ ✦⋆͜͡҈➳ logoportadacounter

─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🛡️❈┉━━━━─`.trim()

    await conn.reply(m.chat, menuLogos, m)
}

handler.help = ['logos']
handler.tags = ['logos']
handler.command = ['logo', 'logos']
handler.register = false 

export default handler