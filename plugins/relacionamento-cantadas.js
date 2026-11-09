/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — !cantada
 */

const CANTADAS = [
    // --- Clássicas e Engraçadas ---
    '🗺️ Você tem um mapa? Me perdi no brilho dos seus olhos.',
    '😵‍💫 Você não é pescoço, mas mexeu com a minha cabeça.',
    '🍔 Se você fosse um sanduíche, seu nome seria X-Princesa!',
    '📱 Meu celular deu erro: ele diz que falta o seu número.',
    '💎 Você não usa roupa, você usa um porta-joias.',
    '🎩✨ Não sou mágico, mas quando te vejo, o resto do mundo some.',
    '🌞 Você não é sol, mas ilumina tudo o que eu nem sabia que estava escuro.',
    '⏳ Se beleza fosse tempo, você seria uma eternidade.',
    '🍫 Você não é chocolate, mas é um vício que eu adoraria ter.',
    '👮 Me prende? Porque roubar meu coração deve ser crime.',

    // --- Safadas e Ousadas ---
    '🔥 Estou me esquentando embaixo das cobertas, mas queria estar me esquentando embaixo de você.',
    '🌑 Essa noite não vou pegar no sono, vou pegar você.',
    '🧪 Com você estou disposto a fazer a química virar muita física.',
    '🪑 Estou muito cansado(a), posso sentar em você?',
    '🤯 Além de me fazer perder a cabeça, mais o que você faz da vida?',
    '🍽️ Hoje o jantar é por minha conta, mas a sobremesa é você.',
    '🧩 Podemos brincar de quebra-cabeça e encaixar um no outro.',
    '🏢 Não sou corretor de imóveis, mas posso te mostrar meu apartamento.',
    '🌦️ Me chama de previsão do tempo e diz que hoje a noite a frente é quente.',
    '📖 Você não é um dicionário, mas com você encontro todas as definições de prazer.',
    '🤤 Aposto que seu beijo deve ser delicioso, fico com água na boca toda vez que te vejo.',
    '🎮 Me chama de videogame e me joga no seu sofá.',
    '☕ Meu gosto por sexo é igual meu gosto por café: forte, quente e diariamente.',
    '🇺🇸 Me chama de Estados Unidos e me USA.',
    '📍 Você deveria se colocar no seu lugar: em cima de mim.',
    '🤐 Que calça linda! Posso testar o zíper?',
    '⭐ Se quiser passar a noite vendo estrelas não se preocupe! Te levo em um lugar que tem 5.',
    '🚗 Já te disse que virei Uber? Agora é só você me contar que horas eu te pego.',
    '🏋️ Beijar na boca queima aproximadamente 7 calorias. Vamos malhar?',
    '💭 Penso em muitas coisas antes de dormir... e a primeira delas é você.',
    '🎁 Te dei feliz dia, mas queria mesmo era dar outra coisa.',
    '🛌 Se eu estou na minha cama e você está na sua, algum de nós está no lugar errado.',
    '🛏️ Você é o amor que sempre sonhei: arruma minha vida e bagunça a minha cama.',
    '🥵 Está quente aqui ou é só você?',
    '♾️ Dizem que fazer amor prolonga a vida, vem cá pra eu te fazer imortal.',
    '👄 Mais bonita que sua boca, só ela nos meus lábios... e não disse quais.',
    '🍭 Tô aqui chupando uma bala mas poderia ser você, topa?'
]

let handler = async (m) => {
    try {
        await m.react('💋').catch(() => {})

        const cantada = CANTADAS[Math.floor(Math.random() * CANTADAS.length)]

        const mensagem = `
💌 *CANTADA:*

"${cantada}"
`.trim()

        await m.reply(mensagem)
    } catch (error) {
        console.error('[CANTADAS]', error)
        await m.reply('❌ As palavras me faltaram agora...')
    }
}

handler.help = ['cantada']
handler.tags = ['relacionamento']
handler.command = ['cantada', 'cantadas', 'xaveco']

export default handler
