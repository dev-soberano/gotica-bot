/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Dev soberano / ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 *
 * Identidade visual da GÓTICA BOT (mesma do menu +18 original):
 * molduras curtas, sem linhas horizontais longas, com a identidade
 * ❈ / ⛧ / ꙲ / ☾⋆ da Gótica.
 */

/** Símbolos do tema Gótica. */
export const TEMA = {
    estrela: '❈',       // ❈ marcador de seção
    lua: '☾⋆',           // ☾⋆
    coracao: '🖤',       // 🖤
    // moldura de cabeçalho (curta)
    topo: '┏━━',
    // divisor de dados
    barra: '┇┆',
    // divisor de categoria
    cat: '┇├┉━┅┅┅┅┅┅┅┅┅⋅≎⋆ᐧ',
    // titulo de categoria
    tituloCat: '─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🌙❈┉━━━━─',
    // rodape
    rodape: '┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆'
}

/**
 * Cabeçalho do menu principal — estilo Gótica.
 */
export function cabecalhoMenu({
    nome = 'Gótica Bot',
    dono = 'Dev Soberano',
    numero = '',
    prefixo = '!',
    vip = 'SIM',
    cargo = 'usuário',
    velocidade = '0.001s',
    uptime = '0s',
    total = 0,
    emoji = '🌙'
} = {}) {
    const E = TEMA.estrela
    const L = TEMA.lua

    let txt = ''
    txt += `┏╾═╼°✩•°: | ⊱✨⊰ | :°•✩°╾═╼┓ ┃ ✧ 𝘽𝙀𝙈-𝙑𝙄𝙉𝘿𝙊 𝘼𝙊 𝙈𝙀𝙉𝙐 ✧ ┗╾═╼°❃•°: | ⊱💋⊰ | :°•❃°╾═╼┛\n`
    txt += `\n`
    txt += `${TEMA.tituloCat}\n\n`
    txt += `${TEMA.barra}🤖 *Bot:* ${nome}\n`
    txt += `${TEMA.barra}👑 *Dono:* ${dono}\n`
    txt += `${TEMA.barra}👤 *Cargo:* ${cargo}\n`
    txt += `${TEMA.barra}💎 *VIP:* ${vip}\n`
    txt += `${TEMA.barra}📍 *Prefixo:* [ ${prefixo} ]\n`
    txt += `${TEMA.barra}🚀 *Ping:* ${velocidade}\n`
    txt += `${TEMA.barra}⏱️ *Ativa:* ${uptime}\n`
    txt += `${TEMA.cat}\n`
    txt += `\n`
    txt += `> ESCOLHA UMA CATEGORIA ABAIXO:`
    txt += `\n`

    return txt
}

/**
 * Cabeçalho de um submenu (categoria) — estilo Gótica.
 */
export function cabecalhoSubmenu({ emoji = '🌙', titulo = 'Menu', descricao = '', total = 0 } = {}) {
    const E = TEMA.estrela
    const L = TEMA.lua

    let txt = ''
    txt += `┏━━ ${emoji} ${titulo} ${emoji} ━━┓\n`
    txt += `\n`
    txt += `${E} *${descricao}* ${E}\n`
    txt += `${TEMA.tituloCat}\n`
    txt += `\n`
    txt += `${TEMA.cat}\n`
    txt += `\n`
    txt += `> ESCOLHA UMA CATEGORIA ABAIXO:\n`
    txt += `${TEMA.rodape}\n`

    return txt
}

/**
 * Painel de donos — formato pedido pelo dono da Gótica (sem rodapé extra).
 */
export function painelDonos({ nome = 'Soberano', numero = '', donos = [], bot = 'Gótica Bot' } = {}) {
    let txt = ''
    txt += `╭━━━━━〔 🏰 〕━━━━━╮\n`
    txt += `┃ *𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎𝐒 𝐃𝐎𝐍𝐎𝐒*\n`
    txt += `┣ ━━━━━━━━━━━━━━━╯\n`
    txt += `┃\n`
    txt += `┃ 🤴 *Dono Principal:*\n`
    txt += `┃ ${nome}\n`
    txt += `┃ ☎ *Número:* ${numero ? '+' + numero : '—'}\n`
    txt += `┃\n`
    txt += `┣━━━〔 👑 〕━━━\n`
    txt += `┃\n`
    for (const d of donos) {
        txt += `┃ 👑 *Dono ${d.slot}:* ${d.valor}\n`
    }
    txt += `╰━━━━━━━━━━━━╯\n`
    txt += `ㅤ\n`

    return txt
}

/**
 * Caixa simples — estilo Gótica.
 */
export function caixaSimples(titulo, linhas = [], emoji = '🌙') {
    const E = TEMA.estrela
    const L = TEMA.lua

    let txt = ''
    txt += `┏━━ ${emoji} ${titulo} ${emoji} ━━┓\n`
    txt += `\n`
    txt += `${E} *${titulo.toUpperCase()}* ${E}\n`
    txt += `${TEMA.tituloCat}\n`
    for (const l of linhas) txt += `${TEMA.barra}${l}\n`
    txt += `\n`
    txt += `${TEMA.rodape}\n`

    return txt
}