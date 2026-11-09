/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const palavras = [
    "gato", "cachorro", "passaro", "elefante", "tigre", "baleia", "borboleta", "tartaruga", 
    "coelho", "sapo", "polvo", "esquilo", "girafa", "jacare", "pinguim", "golfinho", 
    "serpente", "hamster", "mosquito", "abelha", "televisao", "computador", "celular", 
    "internet", "whatsapp", "instagram", "facebook", "brasil", "soberano", "gotica"
]

const tentativasMaximas = 6
const jogo_forca = new Map()

function escolherPalavraAleatoria() {
    return palavras[Math.floor(Math.random() * palavras.length)]
}

function ocultarPalavra(palavra, letrasAdivinhadas) {
    let palavraOculta = "";
    // CORREÇÃO: era 'palabra', mudei para 'palavra' 💋
    for (const letra of palavra) {
        if (letrasAdivinhadas.includes(letra)) {
            palavraOculta += letra + " "; 
        } else {
            palavraOculta += "_ "; 
        }
    }
    return palavraOculta.trim(); 
}

function mostrarForca(tentativas) {
    const desenho = [
        "  ____",
        "  |  |",
        tentativas < 6 ? "  |  O" : "  |",
        tentativas < 5 ? (tentativas < 4 ? "  | /|\\" : "  | /|") : (tentativas < 5 ? "  |  |" : "  |"),
        tentativas < 2 ? (tentativas < 1 ? "  | / \\" : "  | /") : "  |",
        " _|_"
    ]
    return desenho.join("\n")
}

function jogoTerminado(sender, mensagem, palavra, tentativas) {
    if (tentativas === 0) {
        jogo_forca.delete(sender);
        return `❌ *VOCÊ PERDEU!* 🖤\n\n🌙 A palavra correta era: *${palavra.toUpperCase()}*\n\n${mostrarForca(tentativas)}`;
    } else if (!mensagem.includes("_")) {
        jogo_forca.delete(sender);
        return `⭐ *QUE PRO! VOCÊ GANHOU!* 💋\n\n✨ Você adivinhou a palavra: *${palavra.toUpperCase()}*\n💫 Parabéns pela vitória!`;
    }
    return null;
}

let handler = async (m, { conn, usedPrefix }) => {
    // Comando para membros e ADMs
    if (jogo_forca.has(m.sender)) {
        return conn.reply(m.chat, `🌙 Você já tem um jogo em curso! Envie uma letra para jogar.`, m)
    }

    let palavra = escolherPalavraAleatoria()
    let letrasAdivinhadas = []
    let tentativas = tentativasMaximas
    let mensagem = ocultarPalavra(palavra, letrasAdivinhadas)

    jogo_forca.set(m.sender, { palavra, letrasAdivinhadas, tentativas })

    let text = `💋 *VAMOS JOGAR FORCA!*\n\n✨ Adivinhe a palavra:\n> ${mensagem}\n\n⭐ Tentativas restantes: *${tentativas}*\n\n*Responda esta mensagem com uma letra!*`
    conn.reply(m.chat, text, m)
}

handler.before = async (m, { conn }) => {
    let jogo = jogo_forca.get(m.sender)
    if (!jogo || !m.text || m.text.length !== 1 || !m.text.match(/[a-zA-Z]/)) return
    
    let { palavra, letrasAdivinhadas, tentativas } = jogo
    let letra = m.text.toLowerCase()

    if (letrasAdivinhadas.includes(letra)) {
        return conn.reply(m.chat, `✨ Você já disse a letra *${letra}*! Tente outra. 💋`, m)
    }

    letrasAdivinhadas.push(letra)
    if (!palavra.includes(letra)) {
        tentativas--
    }

    let mensagem_oculta = ocultarPalavra(palavra, letrasAdivinhadas)
    let status = jogoTerminado(m.sender, mensagem_oculta, palavra, tentativas)

    if (status) {
        conn.reply(m.chat, status, m)
    } else {
        jogo_forca.set(m.sender, { palavra, letrasAdivinhadas, tentativas })
        let text = `💫 *JOGO DA FORCA* 💫\n\n${mostrarForca(tentativas)}\n\n✨ Palavra:\n${mensagem_oculta}\n\n⭐ Tentativas restantes: *${tentativas}*`
        conn.reply(m.chat, text, m)
    }
    return !0
}

handler.help = ['forca']
handler.tags = ['jogos']
handler.command = ['forca', 'enforcado']
handler.group = true

export default handler