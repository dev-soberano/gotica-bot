/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Jogos de Perguntas
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Jogos portados do Minato:
 *  !quizanimais  - quiz de animais
 *  !quizfutebol - quiz de futebol
 *  !quizfut     - alias
 *  !anagrama    - jogo de anagramas
 *  !enigma      - jogo de enigma
 *  !gartic      - desenho adivinhado
 *  !revelar     - revela a resposta atual
 *  !whatmusic   - adivinha a música
 */

import fs from 'fs'
import path from 'path'
import { shuffle, pickRandom } from '../lib/helpers-minato.js'

const GAME_FILE = path.join(process.cwd(), 'src', 'dados', 'jogos.json')

/** Banco de perguntas de animais. */
const ANIMAIS = [
    { p: 'Qual animal é conhecido como "rei da selva"?', r: 'Leão', o: ['Tiger', 'Lobo', 'Urso'] },
    { p: 'Qual mamífero tem o pescoço mais longo do mundo?', r: 'Girafa', o: ['Elefante', 'Cisne', 'Camelo'] },
    { p: 'Quantos braços tem um polvo?', r: '8', o: ['6', '10', '4'] },
    { p: 'Qual animal é o maior do mundo?', r: 'Baleia-azul', o: ['Elefante', 'Tubarão-branco', 'Rinoceronte'] },
    { p: 'Qual ave é capaz de voar para trás?', r: 'Beija-flor', o: ['Águia', 'Corvo', 'Pinguim'] },
    { p: 'Qual animal dorme de olho aberto?', r: 'Delfim', o: ['Tubarão', 'Golfinho', 'Baleia'] },
    { p: 'Que animal tem listras preto-e-branco?', r: 'Zebra', o: ['Girafa', 'Cebra', 'Antílope'] },
    { p: 'Qual animal pode regenerar membros?', r: 'Salamandra', o: ['Cobra', 'Tartaruga', 'Camaleão'] },
    { p: 'Quantas patas tem uma aranha?', r: '8', o: ['6', '10', '4'] },
    { p: 'Qual é o animal mais rápido da terra?', r: 'Guepardo', o: ['Leão', 'Cavalo', 'Tigre'] }
]

/** Banco de perguntas de futebol. */
const FUTEBOL = [
    { p: 'Em que ano foi a primeira Copa do Mundo?', r: '1930', o: ['1922', '1934', '1950'] },
    { p: 'Quantos jogadores tem um time de futebol em campo?', r: '11', o: ['9', '10', '12'] },
    { p: 'Em que país foi sediada a Copa de 2014?', r: 'Brasil', o: ['Alemanha', 'Espanha', 'França'] },
    { p: 'Quem é o maior artilheiro da história do Brasil?', r: 'Neymar', o: ['Pelé', 'Ronaldo', 'Vini Jr.'] },
    { p: 'Qual é a duração de uma partida de futebol?', r: '90 minutos', o: ['60 minutos', '80 minutos', '120 minutos'] },
    { p: 'Em que posição joga o goleiro?', r: 'Goleiro', o: ['Zagueiro', 'Meia', 'Atacante'] },
    { p: 'Quantos jogadores de cada time entram em campo em uma partida?', r: '11', o: ['10', '9', '12'] },
    { p: 'Qual clube brasileiro é conhecido como "Mengão"?', r: 'Flamengo', o: ['Vasco', 'Botafogo', 'Fluminense'] },
    { p: 'A que altura está a meta do gol?', r: '2,44 m', o: ['1,80 m', '2,00 m', '3,00 m'] },
    { p: 'Quem foi o primeiro brasileiro a jogar na Europa?', r: 'Leônidas da Silva', o: ['Zico', 'Pele', 'Rivelino'] }
]

/** Banco de enigmas. */
const ENIGMAS = [
    { p: 'Tenho plucked, mas não sou uma árvore. O que sou?', r: 'Uma instrumento musical', o: ['Uma folha', 'Uma fruta'] },
    { p: 'Quanto mais você tira, mais fica. O que sou?', r: 'Um buraco', o: ['Uma pedra', 'Um fio de cabelo'] },
    { p: 'Sou cheio de buracos, mas ainda seguro água. O que sou?', r: 'Uma esponja', o: ['Uma peneira', 'Um balde'] },
    { p: 'O que sobe sem quebrar, mas nunca desce?', r: 'A fumaça', o: ['O vapor', 'O balão'] },
    { p: 'Tenho Cities, mas não tenho casas. Tenho Forest, mas não tenho árvores. O que sou?', r: 'Um mapa', o: ['Um livro', 'Um GPS'] },
    { p: 'Quanto mais se tira de mim, mais sobra. O que sou?', r: 'Um palpite', o: ['Uma coisa', 'Um número'] },
    { p: 'Que sempre está à sua frente, mas nunca se vê?', r: 'O futuro', o: ['O passado', 'A memória'] },
    { p: 'Tenho keystrokes mas não sou teclado. O que sou?', r: 'Um piano', o: ['Um computador', 'Uma máquina de escrever'] }
]

/** Palavras para anagrama. */
const ANAGRAMAS = [
    { p: 'AMOR', r: 'ROMA' },
    { p: 'SILENCIOSO', r: 'CONSCILIOS' },
    { p: 'BRASIL', r: 'SABRIL' },
    { p: 'GOTICA', r: 'CATIGO' },
    { p: 'MINATO', r: 'MOTINA' },
    { p: 'WHATSAPP', r: 'APPHSATW' },
    { p: 'ROBOTICA', r: 'BIOTCAR' },
    { p: 'FUTEBOL', r: 'BOLFUTE' }
]

/** Le o estado dos jogos. */
function readJogos() {
    try {
        if (!fs.existsSync(GAME_FILE)) return {}
        return JSON.parse(fs.readFileSync(GAME_FILE, 'utf-8'))
    } catch {
        return {}
    }
}

/** Grava o estado dos jogos. */
function writeJogos(data) {
    try {
        const dir = path.dirname(GAME_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(GAME_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Formata as opções de uma pergunta. */
function formatOpcoes(q, embaralhar) {
    const opcoes = embaralhar ? shuffle([q.r, ...q.o]) : [q.r, ...q.o]
    return opcoes.map((o, i) => `${i + 1}. ${o}`).join('\n')
}

/** Cria uma partida de quiz. */
function iniciarQuiz(grupo, tipo, banco) {
    const db = readJogos()
    const chave = `${tipo}:${grupo}`
    const pergunta = pickRandom(banco)
    const opcoes = shuffle([pergunta.r, ...pergunta.o])

    db[chave] = {
        tipo,
        pergunta: pergunta.p,
        correta: pergunta.r,
        opcoes,
        inicio: Date.now(),
        respondendo: null
    }
    writeJogos(db)

    return db[chave]
}

/** Monta o texto de uma partida de quiz. */
function formatQuiz(jogo) {
    let txt = `🧠 *${jogo.tipo.toUpperCase()}*\n\n`
    txt += `❓ ${jogo.pergunta}\n\n`
    txt += `${jogo.opcoes.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n`
    txt += `💡 *Responda* !quizanimais 1/2/3/4\n`
    txt += `⏱️ Você tem 60 segundos!`
    return txt
}

const handler = async (m, { args, command, text }) => {
    const cmd = (command || '').toLowerCase()
    const grupo = m.chat
    const db = readJogos()

    // ══════════════ QUIZ ══════════════
    if (cmd === 'quizanimais' || cmd === 'quizfutebol' || cmd === 'quizfut') {
        const tipo = cmd === 'quizanimais' ? 'quizanimais' : 'quizfutebol'
        const banco = tipo === 'quizanimais' ? ANIMAIS : FUTEBOL

        // Se o jogador está respondendo, trata a resposta
        const chave = `${tipo}:${grupo}`
        const jogo = db[chave]

        if (jogo && jogo.respondendo === m.sender && /^\d+$/.test(args[0])) {
            const idx = Number(args[0]) - 1
            const escolhida = jogo.opcoes[idx]

            if (!escolhida) return m.reply('❌ *Opção inválida!* Use 1, 2, 3 ou 4.')

            delete db[chave]
            writeJogos(db)

            if (escolhida === jogo.correta) {
                const tempo = Math.floor((Date.now() - jogo.inicio) / 1000)
                return m.reply(`✅ *CORRETO!*\n\n🎉 Você acertou em *${tempo}s*!\n\n💡 Use \`!${tipo}\` para jogar de novo.`)
            }
            return m.reply(`❌ *ERRADO!*\n\n✅ Resposta correta: *${jogo.correta}*\n\n💡 Use \`!${tipo}\` para jogar de novo.`)
        }

        // Inicia uma nova partida
        const novo = iniciarQuiz(grupo, tipo, banco)
        novo.respondendo = m.sender
        writeJogos(db)

        return m.reply(formatQuiz(novo))
    }

    // ══════════════ ANAGRAMA ══════════════
    if (cmd === 'anagrama') {
        const chave = `anagrama:${grupo}`
        const jogo = db[chave]

        if (jogo && jogo.respondendo === m.sender && text) {
            const tentativa = text.toLowerCase().replace(/[^a-z]/g, '')
            delete db[chave]
            writeJogos(db)

            if (tentativa === jogo.correta.toLowerCase()) {
                return m.reply(`✅ *CORRETO!*\n\n🎉 A anagrama era *${jogo.correta}*!\n\n💡 Use \`!anagrama\` para jogar de novo.`)
            }
            return m.reply(`❌ *ERRADO!*\n\n✅ A anagrama era *${jogo.correta}*\n\n💡 Use \`!anagrama\` para jogar de novo.`)
        }

        const p = pickRandom(ANAGRAMAS)
        const novo = {
            tipo: 'anagrama',
            embaralhado: shuffle(p.p.split('')).join(''),
            correta: p.r,
            inicio: Date.now(),
            respondendo: m.sender
        }
        db[chave] = novo
        writeJogos(db)

        return m.reply(`🔤 *ANAGRAMA!*\n\n🔀 *${novo.embaralhado}*\n\n💡 Forme a palavra original!\n⏱️ Você tem 60 segundos!`)
    }

    // ══════════════ ENIGMA ══════════════
    if (cmd === 'enigma') {
        const chave = `enigma:${grupo}`
        const jogo = db[chave]

        if (jogo && jogo.respondendo === m.sender && text) {
            delete db[chave]
            writeJogos(db)
            return m.reply(`✅ *Resposta registrada!*\n\n✅ Resposta: *${jogo.correta}*\n\n💡 Use \`!enigma\` para jogar de novo.`)
        }

        const p = pickRandom(ENIGMAS)
        const novo = {
            tipo: 'enigma',
            pergunta: p.p,
            correta: p.r,
            opcoes: shuffle([p.r, ...p.o]),
            inicio: Date.now(),
            respondendo: m.sender
        }
        db[chave] = novo
        writeJogos(db)

        return m.reply(`🧩 *ENIGMA!*\n\n❓ ${novo.pergunta}\n\n${novo.opcoes.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n💡 *Responda* !enigma <1/2/3>`)
    }

    // ══════════════ GARTIC ══════════════
    if (cmd === 'gartic') {
        const chave = `gartic:${grupo}`
        const jogo = db[chave]

        if (!jogo) {
            const novo = {
                tipo: 'gartic',
                palavra: pickRandom(ANAGRAMAS).p.toLowerCase(),
                tentativas: 0,
                inicio: Date.now()
            }
            db[chave] = novo
            writeJogos(db)

            return m.reply(`🎨 *GARTIC!*\n\n📝 Desenhe a imagem abaixo no canal!\n\n🔒 *Palavra:* \`${novo.palavra}\`\n\n💡 \`!revelar\` — revela a palavra`)
        }

        return m.reply(`🎨 *GARTIC ATIVO!*\n\n🔒 *Palavra:* \`${jogo.palavra}\`\n🎯 *Tentativas:* ${jogo.tentativas}\n\n💡 \`!revelar\` — revela`)
    }

    // ══════════════ REVELAR ══════════════
    if (cmd === 'revelar' || cmd === 'revelarenigma' || cmd === 'revelargartic') {
        const chave = `${cmd.includes('gartic') ? 'gartic' : cmd.includes('enigma') ? 'enigma' : 'anagrama'}:${grupo}`
        const jogo = db[chave]
        if (!jogo) return m.reply('❌ *Não há jogo ativo para revelar!*')

        delete db[chave]
        writeJogos(db)

        const resposta = jogo.palavra || jogo.correta || '???'
        return m.reply(`🔓 *REVELADO!*\n\n✅ A resposta era: *${resposta}*`)
    }

    // ══════════════ WHATMUSIC ══════════════
    if (cmd === 'whatmusic' || cmd === 'reconhecermusica') {
        const chave = `whatmusic:${grupo}`
        const jogo = db[chave]

        if (jogo && jogo.respondendo === m.sender && text) {
            delete db[chave]
            writeJogos(db)
            return m.reply(`✅ *Resposta registrada!*\n\n🎵 A música era: *${jogo.correta}*`)
        }

        const musicas = [
            { r: 'Never Gonna Give You Up', a: 'Rick Astley' },
            { r: 'Bohemian Rhapsody', a: 'Queen' },
            { r: 'Despacito', a: 'Luis Fonsi' },
            { r: 'Shape of You', a: 'Ed Sheeran' },
            { r: 'Blinding Lights', a: 'The Weeknd' },
            { r: 'Evidências', a: 'Chitãozinho e Xororó' }
        ]
        const mus = pickRandom(musicas)
        const novo = {
            tipo: 'whatmusic',
            correta: `${mus.r} - ${mus.a}`,
            inicio: Date.now(),
            respondendo: m.sender
        }
        db[chave] = novo
        writeJogos(db)

        return m.reply(`🎵 *ADIVINHE A MÚSICA!*\n\n🎤 *Dica:* ${mus.a}\n\n💡 *Responda* !whatmusic <nome da música>`)
    }
}

handler.help = ['quizanimais', 'quizfutebol', 'anagrama', 'enigma', 'gartic', 'revelar', 'whatmusic']
handler.tags = ['game', 'jogo']
handler.command = ['quizanimais', 'quizfutebol', 'quizfut', 'anagrama', 'enigma', 'gartic',
    'revelar', 'revelarenigma', 'revelargartic', 'whatmusic', 'reconhecermusica']

export default handler
