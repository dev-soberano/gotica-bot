/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {};
let jail = {};

const handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para cometer crimes.* 🍷')

    let senderId = m.sender;
    
    if (!chat.users) chat.users = {}
    if (!chat.users[senderId]) chat.users[senderId] = { coin: 0, bank: 0 }
    let userGroup = chat.users[senderId];

    const cooldown = 5 * 60 * 1000; 
    const jailCooldown = 30 * 60 * 1000; 

    if (jail[senderId] && Date.now() < jail[senderId]) {
        const remaining = segundosAHMS(Math.ceil((jail[senderId] - Date.now()) / 1000));
        return m.reply(`🚔 *VOCÊ ESTÁ PRESO!* \n\nNão pode cometer crimes agora. Faltam *${remaining}* para sua soltura.`)
    }

    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
        const remaining = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000));
        return m.reply(`🚔 *A POLÍCIA ESTÁ PATRULHANDO!* \n\nAguarde *${remaining}* até que a poeira abaixe.`)
    }

    const outcome = Math.random();
    const jailChance = 0.15; 
    const successChance = 0.70;
    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    if (outcome < jailChance) {
        jail[senderId] = Date.now() + jailCooldown;
        const reason = pickRandom(frasesPolicia);
        await m.react('🚔')
        return m.reply(`👮‍♂️ *PERDEU, MALANDRO!* \n\n${reason}. Você foi levado para a delegacia e ficará preso por 30 minutos.`)

    } else if (outcome < jailChance + successChance) {
        // Lucro equilibrado (R$ 500 a R$ 2.500)
        const amount = Math.floor(Math.random() * 2000 + 500);
        userGroup.coin += amount;
        const reason = pickRandom(frasesExito);
        await m.react('💰')
        await m.reply(`🎭 *CRIME PERFEITO!* \n\n${reason}.\n\n💰 *Lucro:* ${formatar(amount)}\n📈 *Saldo Atual:* ${formatar(userGroup.coin)}`)

    } else {
        // Prejuízo equilibrado (R$ 300 a R$ 1.200)
        const amount = Math.floor(Math.random() * 900 + 300);
        
        if (userGroup.coin >= amount) {
            userGroup.coin -= amount;
        } else {
            let restante = amount - userGroup.coin;
            userGroup.coin = 0;
            userGroup.bank = Math.max(0, userGroup.bank - restante);
        }

        const reason = pickRandom(frasesFracaso);
        await m.react('🤡')
        await m.reply(`💀 *DEU RUIM!* \n\n${reason}.\n\n💸 *Prejuízo:* ${formatar(amount)}\n> Restou: ${formatar(userGroup.coin)} na carteira.`)
    }

    cooldowns[senderId] = Date.now();
};

handler.help = ['crime']
handler.tags = ['economia']
handler.command = ['crimen', 'crime'] // Removido 'assaltar' como pedido
handler.group = true

export default handler;

function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60);
    let segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const frasesExito = [
    "🏦 Você assaltou um banco e a tempestade de neve cobriu suas pegadas",
    "💻 Hackeou o sistema de uma loja online e desviou centavos de milhares de compras",
    "🚚 Interceptou um caminhão de carga cheio de consoles de videogame",
    "💎 Entrou em uma festa de gala e roubou joias dos casacos no guarda-volumes",
    "💳 Clonou cartões de crédito em um posto de gasolina muito movimentado",
    "🔔 Arrecadou dinheiro com um posto de 'doações' falso em uma esquina movimentada",
    "🧑‍🔧 Se passou por técnico de manutenção e roubou casas que estavam vazias",
    "🎆 Roubou um carregamento de fogos de artifício e vendeu pelo triplo do preço",
    "📱 Descobriu uma falha no sistema de uma app de presentes e desviou produtos caros",
    "🌲 Roubou a 'melhor' árvore de um lote de Natal e a revendeu",
    "📦 Virou um 'pirata de varanda' e levou pacotes das entradas das casas",
    "💰 Agiu como batedor de carteiras em um mercado lotado e ninguém percebeu",
    "🔑 Levou um carro que deixaram ligado para aquecer o motor",
    "🍕 Assaltou um entregador de pizza, levando o dinheiro e as pizzas",
    "🎫 Enganou um turista vendendo ingressos falsos para um evento VIP",
    "☕ Roubou a caixa de gorjetas da cafeteria enquanto todos pediam bebidas",
    "📈 Leiloou um 'brinquedo exclusivo esgotado' falso na internet por 30 vezes o valor",
    "🧑‍💼 Levou todos os presentes de um 'Amigo Invisível' de uma empresa inteira",
    "🧂 Roubou uma máquina de sal para gelo e vendeu o conteúdo a preço de ouro",
    "🎩 Se passou por valet em uma festa e 'perdeu' um carro de luxo",
    "🦌 Roubou um trenó decorativo antigo de um jardim e vendeu para um colecionador"
];

const frasesFracaso = [
    "😵 Tentou entrar numa casa pela chaminé, ficou entalado e teve que pagar o resgate",
    "🌊 Saiu correndo do banco, escorregou no gelo e o botim caiu num bueiro",
    "🥶 Tentou roubar um caminhão, mas ele atolou na neve e você teve que pagar o guincho",
    "🛰️ Roubou joias, mas uma tinha GPS oculto. Teve que jogar tudo no rio para não ser pego",
    "💸 O sistema da loja que você hackeou reverteu as transações e te cobrou taxas",
    "💥 Tentou roubar um limpa-neve, mas bateu na vitrine de uma loja e pagou o prejuízo",
    "🤑 O dinheiro roubado estava marcado com tinta. Você gastou tudo tentando se limpar",
    "🥵 Tentou roubar um carro, mas o dono ligou o aquecedor no máximo e você quase desmaiou",
    "🧨 O caminhão de fogos que você roubou explodiu antes da venda. Prejuízo total",
    "🦷 Roubou uma bolsa que só tinha cupones vencidos e um torrone duro que quebrou seu dente",
    "🐱 O pacote que você roubou da varanda continha areia de gato usada",
    "🤓 Se passou por técnico, mas o dono da casa era policial e te aplicou uma multa",
    "⛽ O carro que você roubou ficou sem gasolina em dois quarteirões. Pagou caro no táxi de fuga",
    "⛓️ A caixa de doações estava chumbada no chão. O barulho chamou a atenção e você quebrou o pé",
    "🤦 Escorregou fugindo e seu celular caiu no bueiro. Teve que comprar outro",
    "🍂 Roubou um trenó que estava podre. Ele quebrou e você caiu num arbusto de espinhos",
    "📉 O cartão que você clonou estava estourado. O banco te cobrou taxas por tentativa de fraude",
    "🤢 Se escondeu da polícia num lixeiro e acabou sendo levado pelo caminhão de lixo",
    "🦝 A árvore que você roubou estava cheia de guaxinis furiosos. Gastou com vacinas",
    "🧥 Roubou um casaco caro que na verdade era uma imitação barata que rasgou na fuga"
];

const frasesPolicia = [
    "👣 Suas pegadas na neve fresca levaram os policiais direto ao seu esconderijo",
    "🎤 Tentou se esconder num grupo de cantores, mas não sabia a letra e desentonou",
    "🚕 Ficou preso no trânsito de um desfile e a polícia te cercou",
    "✨ O reflexo das luzes de Natal na sua arma denunciou sua posição",
    "🛴 Fugiu num patinete elétrico, mas a bateria acabou no meio do caminho",
    "⛄ Se escondeu dentro de um boneco de neve inflável e foi pego quando ele murchou",
    "🧣 A vítima te descreveu pelo seu gorro de lã horrível",
    "🏠 Tentou fugir pela chaminé e ficou entalado até a polícia chegar",
    "📍 O GPS de um dos presentes roubados guiou a viatura até sua casa",
    "🧵 Deixou seu cachecol personalizado na cena do crime",
    "🤕 Escorregou no gelo e caiu bem aos pés de um oficial que patrulhava",
    "🧑‍🎄 O Papai Noel que você empurrou era um policial disfarçado",
    "📱 Seu celular tocou um funk alto enquanto você se escondia em sacolas de presentes",
    "📸 Uma câmera de segurança 4K gravou seu rosto sem máscara",
    "📡 O carro roubado tinha bloqueador remoto. A polícia só chegou e te buscou",
    "👮 Tentou vender a mercadoria roubada para um detetive à paisana",
    "🤦‍♂️ Esqueceu de deslogar do seu Facebook no computador da loja que hackeou",
    "🤔 O entregador que você assaltou era seu vizinho e te reconheceu pela voz",
    "♨️ O cheiro de castanhas queimadas nas suas roupas te denunciou para os cães farejadores",
    "🛸 Um drone capturou toda a sua ação de cima e mandou pro COP",
    "🧱 Correu para um beco sem saída que estava bloqueado por um muro de neve"
];