/*
* ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
* ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
* ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
* @author Dev Leandro 
* @project Gótica Bot - O Dicionário do Pecado 💋🌙
*/

const significados = {
    // 🌑 AS LUAS (CLÁSSICAS)
    '🌝': 'te como; 💋', '🌚': 'me come; 🖤', '☀️': 'gozei; ✨', '🌙': 'estou dando; 💫',
    '🌛': 'sou santa; ⭐', '🌜': 'sou safada; 🌙', '🌑': 'meu cu; 🖤', '🌒': 'sou virgem; ✨',
    '🌓': 'adoro chupar; 💫', '🌕': 'aperta meus peitos; 💋', '🌔': 'me chupa; ⭐',

    // 👅 BOCA E ROSTO
    '😋': 'querendo comer alguém; 💋', '😈': 'hoje eu tô pro crime; 🖤', '👅': 'imagina onde essa língua vai; ✨',
    '🤤': 'tô babando por esse corpo; 💫', '😏': 'sei bem o que você quer; 🌙', '🤫': 'nosso segredinho no PV; ⭐',
    '🤐': 'minha boca tá ocupada; 🖤', '🥵': 'tô com muito fogo; 💋', '👄': 'querendo um beijo molhado; ✨',
    '🤡': 'fui feito de palhaço, mas a sentada é boa; 💫', '🤪': 'louco(a) pra perder a linha; 🌙',
    '😇': 'cara de anjo, mas o rabo é do capeta; ⭐', '🧐': 'analisando o tamanho do pacote; 🖤',

    // 🔥 FOGO E FLUIDOS
    '🔥': 'tô pegando fogo, vem apagar; 💋', '💦': 'já tô molhadinha(o); ✨', '💧': 'gotinhas de prazer; 💫',
    '🌊': 'vai ser uma tempestade de prazer; 🌙', '🌋': 'prestes a explodir; ⭐',

    // 🍑 CORPO E FRUTAS
    '🍆': 'tamanho é documento sim; 🖤', '🍑': 'tá pedindo um tapa; 💋', '🍒': 'quero que você morda; ✨',
    '🍌': 'quer descascar a minha?; 💫', '🌽': 'vai entrar com tudo; 🌙', '🍯': 'tô meladinha(o); ⭐',
    '🥨': 'quero fazer uma posição nova; 🖤', '🌮': 'minha conchinha tá aberta; 💋', '🥯': 'sentada circular; ✨',
    '🍼': 'querendo um leitinho; 💫', '🍦': 'hora de dar uma lambidinha; 🌙', '🍭': 'chupa que é doce; ⭐',
    '🥕': 'duro igual um pau; 🖤', '🍓': 'adocica meu desejo; 💋',

    // 🐾 ANIMAIS E OBJETOS
    '🐱': 'minha gatinha tá carente; ✨', '🐍': 'olha a cobra entrando no buraco; 💫', '🐇': 'vamos rapidinho igual coelho; 🌙',
    '🐷': 'quero fazer porquice; ⭐', '🐎': 'quero cavalgar em você; 🖤', '🕷️': 'vou te prender na minha teia; 💋',
    '🔒': 'sou só seu(sua), pode usar; ✨', '🔑': 'você tem a chave do meu prazer; 💫', '🕯️': 'clima de fetiche no escuro; 🌙',
    '⛓️': 'pode me prender e me usar; ⭐', '🧨': 'vai ser um estouro; 🖤', '🥊': 'pode bater que eu gosto; 💋',
    '🧼': 'tira a roupa que eu te ensabôo; ✨', '🛌': 'vem pro meu quarto agora; 💫',

    // ✨ GESTOS
    '👉': 'cutuca que eu gosto; 🌙', '👌': 'no ponto certo; ⭐', '🤞': 'torcendo pra gente transar; 🖤',
    '🤙': 'me liga quando estiver no cio; 💋', '✊': 'mão firme na pegada; ✨', '🤏': 'desse tamanho não faz nem cócega; 💫',
    '🤝': 'fechado, vamos pro motel; 🌙'
}

let handler = async (m, { conn, text }) => {
    // Tenta pegar o emoji do texto ou de uma mensagem marcada
    let emoji = text ? text.trim() : null
    if (!emoji && m.quoted) {
        emoji = m.quoted.text || m.quoted.caption || null
    }

    if (!emoji) {
        return conn.reply(m.chat, 'Soberano, mande o emoji ou responda um! Ex: */sig 🍑* 💋⭐', m)
    }

    // Pega o primeiro emoji enviado
    const primeiroEmoji = Array.from(emoji)[0]
    const significado = significados[primeiroEmoji]

    if (significado) {
        let resposta = `💋 *𝗗𝗜𝗖𝗜𝗢𝗡𝗔́𝗥𝗜𝗢 𝗗𝗔 𝗚𝗢́𝗧𝗜𝗖𝗔* 🌙\n\nO significado de ${primeiroEmoji} é:\n👉 _${significado}_`
        
        await conn.sendMessage(m.chat, { text: resposta }, { quoted: m })
    } else {
        await conn.reply(m.chat, `Eita! O emoji ${primeiroEmoji} ainda não tá no meu livrinho preto, mas com certeza é algo bem safado! 🖤✨`, m)
    }
}

handler.help = ['sig']
handler.tags = ['member']
handler.command = /^(sig|significado)$/i

export default handler