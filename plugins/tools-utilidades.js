/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Utilidades Diversas
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Utilidades portadas do Minato:
 *  !encurtalink  - encurta URL
 *  !getsite      - info de um site
 *  !gethtml      - HTML de uma página
 *  !getquoted    - texto da mensagem quotada
 *  !getinfo      - info do grupo/usuário
 *  !write        - escreve um texto em arquivo
 *  !mecheck      - checagem de conta
 *  !wame         - wa.me
 *  !chance       - porcentagem aleatória
 *  !sorteio      - (ver grupo-gestao)
 *  !conselhos    - conselhos do dia
 *  !fatos        - fatos ALEatórios
 *  !curiosidades - curiosidades
 *  !signo        - signo do dia
 *  !idade        - idade
 *  !counter      - contador
 *  !contador     - contador de mensagens
 */

import axios from 'axios'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { formatNumber, jidNum } from '../lib/helpers-minato.js'

const COUNT_FILE = path.join(process.cwd(), 'src', 'dados', 'contador.json')

/** Lê os contadores. */
function readCount() {
    try {
        if (!fs.existsSync(COUNT_FILE)) return { global: 0, grupos: {}, users: {} }
        const p = JSON.parse(fs.readFileSync(COUNT_FILE, 'utf-8'))
        return { global: p.global || 0, grupos: p.grupos || {}, users: p.users || {} }
    } catch {
        return { global: 0, grupos: {}, users: {} }
    }
}

/** Grava os contadores. */
function writeCount(data) {
    try {
        const dir = path.dirname(COUNT_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(COUNT_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Conselhos do dia. */
const CONSELHOS = [
    'Não aceite nada de menos que o que você merece.',
    'Quem tem coragem de começar, vence no caminho.',
    'O sucesso é a soma de pequenos esforços repetidos.',
    'Seja tão bom que pareça impossível até você.',
    'Disciplina é escolher entre o que você quer agora e o que você quer mais.',
    'Não deixe o medo de falhar te impedir de tentar.',
    'Trate as pessoas como você gostaria de ser tratado.',
    'O melhor momento para começar foi ontem. O segundo melhor é agora.',
    'Você não precisa ser perfeito, precisa ser constante.',
    'Grandes jornadas começam com um primeiro passo.',
    'Silêncio também é uma resposta.',
    'Quem não arrisca, não acerta.',
    'A nuvem que está no céu não lhe traz chuva.',
    'Foque no que você pode controlar.',
    'Sua attitude define sua altitude.'
]

/** Fatos aleatórios. */
const FATOS = [
    'A água do planeta é 97% salgada.',
    'O Oceano Pacífico é maior que todos os continentes somados.',
    'O coração continua batendo fora do corpo por um tempo.',
    'Existências que duram frações de segundo são constantes na natureza.'
]

/** Curiosidades. */
const CURIOSIDADES = [
    '🎨 Van Gogh pintou mais de 2.000 obras em vida.',
    '🍯 Mel nunca estraga. Archaeological jars com mel de 3.000 anos ainda são comestíveis.',
    '🐙 Polvos têm três corações e sangue azul.',
    '🌍 Saturno é menos denso que a água.',
    '⚡ Um raio pode carregar 30 bilhões de volts de eletricidade.',
    '🧠 O cérebro humano usa cerca de 20% da energia do corpo.',
    '🌊 Um único raio de relâmpago pode aquecer o ar a 30.000°C.',
    '🏔️ A Everest cresce cerca de 4 mm por ano.',
    '🦈 Tubarões existiam antes das árvores.',
    '🪐 Neptune levou 165 anos para completar uma órbita.'
]

/** Signos do dia. */
const SIGNOS = {
    'aries': '🔥 Coragem e iniciativa. leader today.',
    'touro': '💪 Paciência e persistência.',
    'gêmeos': '💬 Comunicação e curiosidade.',
    'cancer': '🌙 Emoção e acolhimento.',
    'leao': '👑 Confiança e brilho.',
    'virk': '✍️ Criatividade e expressão.',
    'libra': '⚖️ Equilíbrio e diplomacia.',
    'escorpiao': '🔮 Intuição e profundidade.',
    'sagitario': '🏹 Aventureiro e otimista.',
    'capricórnio': '🏔️ Determinação e ambição.',
    'aquário': '💡 Originalidade e visão.',
    'peixes': '🌊 Sensibilidade e imaginação.'
}

const handler = async (m, { conn, args, command, text, usedPrefix, isSoberano, groupMetadata }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !encurtalink ----------
    if (cmd === 'encurtalink' || cmd === 'shorten' || cmd === 'tinyurl') {
        const url = text.trim()
        if (!url) return m.reply('📝 *Uso:*\n!encurtalink <url>\n\n*Exemplo:* `!encurtalink https://google.com`')
        try {
            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
            return m.reply(`🔗 *Link encurtado!*\n\n${res.data}`)
        } catch {
            return m.reply('❌ Erro ao encurtar o link.')
        }
    }

    // ---------- !getsite ----------
    if (cmd === 'getsite') {
        const url = text.trim()
        if (!url) return m.reply('📝 *Uso:*\n!getsite <url>')
        try {
            const target = /^https?:\/\//i.test(url) ? url : `https://${url}`
            const res = await axios.get(target, { timeout: 15000, maxRedirects: 3 })
            let txt = `🌐 *INFORMAÇÕES DO SITE*\n\n`
            txt += `🔗 *URL:* ${target}\n`
            txt += `📡 *Status:* ${res.status}\n`
            txt += `📄 *Título:* ${res.data?.match?.(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'N/D'}\n`
            txt += `📏 *Tamanho:* ${formatNumber(JSON.stringify(res.data).length)} bytes`
            return m.reply(txt)
        } catch (e) {
            return m.reply(`❌ *Erro ao acessar o site!*\n\n${e.message}`)
        }
    }

    // ---------- !gethtml ----------
    if (cmd === 'gethtml' || cmd === 'getsitehtml') {
        const url = text.trim()
        if (!url) return m.reply('📝 *Uso:*\n!gethtml <url>')
        try {
            const target = /^https?:\/\//i.test(url) ? url : `https://${url}`
            const res = await fetch(target)
            const html = await res.text()
            if (html.length > 3000) {
                const doc = await conn.sendMessage(m.chat, {
                    document: Buffer.from(html),
                    fileName: `pagina-${Date.now()}.html`,
                    mimetype: 'text/html',
                    caption: `📄 *HTML da página*\n\n🔗 ${target}`
                }, { quoted: m })
            }
            return m.reply(`📄 *HTML enviado!*\n\n🔗 ${target}\n📏 ${formatNumber(html.length)} caracteres`)
        } catch (e) {
            return m.reply(`❌ Erro ao buscar o HTML.\n\n${e.message}`)
        }
    }

    // ---------- !getquoted ----------
    if (cmd === 'getquoted' || cmd === 'mek' || cmd === 'divmsg' || cmd === 'div') {
        const q = m.quoted
        if (!q) return m.reply('❌ *Responda a uma mensagem!*')
        const txt = q.text || q.caption || q.body || ''
        if (!txt) return m.reply('❌ A mensagem quotada não tem texto.')

        // Divide em pedaços se for muito longo
        const MAX = 3500
        if (txt.length <= MAX) return m.reply(`📝 *MENSAGEM QUOTADA*\n\n${txt}`)

        const partes = []
        for (let i = 0; i < txt.length; i += MAX) partes.push(txt.slice(i, i + MAX))
        for (let i = 0; i < partes.length; i++) {
            await m.reply(`📝 *MENSAGEM QUOTADA* *(${i + 1}/${partes.length})*\n\n${partes[i]}`)
        }
        return
    }

    // ---------- !getinfo ----------
    if (cmd === 'getinfo' || cmd === 'getperfil' || cmd === 'perfil') {
        const target = args[0] || m.sender
        const num = jidNum(target)
        let txt = `👤 *INFORMAÇÕES*\n\n`
        txt += `📱 *Número:* +${num}\n`
        txt += `🔗 *JID:* \`${num}@s.whatsapp.net\`\n`
        txt += `📛 *Nome:* ${m.pushName || 'Desconhecido'}\n`
        txt += `📅 *Registrado:* ${new Date().getFullYear()}\n`
        try {
            const res = await axios.get(`https://api.brapih.com.br/api/numero/${num}`)
            const d = res.data
            if (d?.status === true || d?.valido) {
                txt += `✅ *WhatsApp:* Válido\n`
                txt += `📡 *Operadora:* ${d.operadora || 'N/D'}\n`
                txt += `🔋 *Tipo:* ${d.tipo || 'N/D'}\n`
            } else {
                txt += `❌ *WhatsApp:* Inválido\n`
            }
        } catch {
            txt += `📡 *Operadora:* N/D\n`
        }
        return m.reply(txt)
    }

    // ---------- !write ----------
    if (cmd === 'write' || cmd === 'escrever') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!text) return m.reply('📝 *Uso:*\n!write <conteúdo>')
        const file = path.join(process.cwd(), 'src', 'dados', 'write.txt')
        try {
            fs.writeFileSync(file, text, 'utf-8')
            return m.reply(`✅ *Texto salvo!*\n\n📄 \`src/dados/write.txt\``)
        } catch {
            return m.reply('❌ Erro ao salvar o texto.')
        }
    }

    // ---------- !chance ----------
    if (cmd === 'chance' || cmd === 'probabilidade') {
        const pct = Math.floor(Math.random() * 101)
        const item = text.trim() || 'isso'
        const bar = '█'.repeat(Math.floor(pct / 10)).padEnd(10, '░')
        return m.reply(`🎲 *CHANCE*\n\n📊 *${item}*\n\n\`${bar}\` *${pct}%*`)
    }

    // ---------- !conselhos / !conselhob ----------
    if (cmd === 'conselhos' || cmd === 'conselhob' || cmd === 'conselhosb' || cmd === 'conselhobiblico' || cmd === 'conselhosbiblico') {
        const c = CONSELHOS[Math.floor(Math.random() * CONSELHOS.length)]
        const biblico = cmd.includes('biblico')
        return m.reply(`${biblico ? '📖' : '💡'} *CONSELHO DO DIA*\n\n_${c}_\n\n✨ *by Gótica Bot*`)
    }

    // ---------- !fatos ----------
    if (cmd === 'fatos') {
        const f = FATOS[Math.floor(Math.random() * FATOS.length)]
        return m.reply(`🧠 *FATO CURIOSO*\n\n_${f}_`)
    }

    // ---------- !curiosidades ----------
    if (cmd === 'curiosidades' || cmd === 'curiosidade') {
        const c = CURIOSIDADES[Math.floor(Math.random() * CURIOSIDADES.length)]
        return m.reply(`🔎 *CURIOSIDADE*\n\n_${c}_`)
    }

    // ---------- !signo ----------
    if (cmd === 'signo') {
        const arg = (args[0] || '').toLowerCase()
        const key = Object.keys(SIGNOS).find(k => arg.startsWith(k))
        if (!key) {
            return m.reply(`🔮 *SIGNOS*\n\n${Object.entries(SIGNOS).map(([k, v]) => `• *${k}* — ${v}`).join('\n')}\n\n💡 \`!signo leao\``)
        }
        return m.reply(`🔮 *SIGNO: ${key.toUpperCase()}*\n\n${SIGNOS[key]}\n\n✨ *by Gótica Bot*`)
    }

    // ---------- !idade ----------
    if (cmd === 'idade') {
        const anos = parseInt(args[0])
        if (!anos || anos < 0 || anos > 130) {
            return m.reply('📝 *Uso:*\n!idade <seus anos>\n\n*Exemplo:* `!idade 25`')
        }
        const msg = `🎂 *IDADE*\n\n📅 Você tem *${anos} anos*!\n\n✨ Que venham mais muitos.`
        return m.reply(msg)
    }

    // ---------- !contador / !counter / !contadormsg ----------
    if (cmd === 'contador' || cmd === 'counter' || cmd === 'contadormsg' || cmd === 'contagem') {
        const db = readCount()
        db.global++
        if (m.isGroup) db.grupos[m.chat] = (db.grupos[m.chat] || 0) + 1
        db.users[m.sender] = (db.users[m.sender] || 0) + 1
        writeCount(db)

        let txt = `🔢 *CONTADOR*\n\n`
        txt += `🌍 *Global:* ${formatNumber(db.global)} mensagens\n`
        if (m.isGroup) txt += `👥 *Neste grupo:* ${formatNumber(db.grupos[m.chat] || 0)} mensagens\n`
        txt += `👤 *Suas mensagens:* ${formatNumber(db.users[m.sender] || 0)}`
        return m.reply(txt)
    }

    // ---------- !mecheck ----------
    if (cmd === 'mecheck' || cmd === 'checkme') {
        const db = readCount()
        const num = jidNum(m.sender)
        let txt = `🔎 *MEU CHECK*\n\n`
        txt += `👤 *Suas mensagens:* ${formatNumber(db.users[m.sender] || 0)}\n`
        txt += `🌍 *Mensagens globais:* ${formatNumber(db.global)}\n`
        if (m.isGroup) txt += `👥 *Neste grupo:* ${formatNumber(db.grupos[m.chat] || 0)}\n`
        txt += `\n✨ *by Gótica Bot*`
        return m.reply(txt)
    }

    // ---------- !wame ----------
    if (cmd === 'wame') {
        const num = jidNum(args[0] || m.sender)
        if (!num) return m.reply('📝 *Uso:*\n!wame <numero>')
        return m.reply(`🔗 *Link wa.me*\n\nhttps://wa.me/${num}`)
    }

    // ---------- !velha / !jogodavelha (jogo da velha) ----------
    if (cmd === 'velha' || cmd === 'jogodavelha' || cmd === 'jogov') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const estado = global.jogoVelha || (global.jogoVelha = {})
        const jogo = estado[m.chat]

        if (!jogo) {
            estado[m.chat] = {
                tabuleiro: Array(9).fill(null),
                jogador: 'X',
                terminou: false,
                vencedor: null,
                jogadas: 0
            }
            return m.reply(`❌⭕ *JOGO DA VELHA*\n\n${tabuleiroTexto(Array(9).fill(null))}\n\n👤 *Vez de X* — envie a posição (1-9) ou \`!velha reiniciar\``)
        }

        if (jogo.terminou) {
            return m.reply(`🏁 *JOGO ENCERRADO!*\n\n${tabuleiroTexto(jogo.tabuleiro)}\n\n🏆 Vencedor: *${jogo.vencedor}*\n💡 \`!velha reiniciar\` para jogar de novo`)
        }

        if (cmd === 'velha' && args[0]?.toLowerCase() === 'reiniciar') {
            estado[m.chat] = { tabuleiro: Array(9).fill(null), jogador: 'X', terminou: false, vencedor: null, jogadas: 0 }
            return m.reply(`🔄 *Jogo reiniciado!*\n\n👤 *Vez de X* — envie a posição (1-9)`)
        }

        const pos = parseInt(args[0]) - 1
        if (isNaN(pos) || pos < 0 || pos > 8) {
            return m.reply(`📝 *Jogue escolhendo uma posição de 1 a 9.*\n\n${tabuleiroTexto(jogo.tabuleiro)}\n\n👤 Vez de *${jogo.jogador}*`)
        }
        if (jogo.tabuleiro[pos]) return m.reply('❌ Essa posição já está ocupada!')

        jogo.tabuleiro[pos] = jogo.jogador
        jogo.jogadas++
        jogo.jogador = jogo.jogador === 'X' ? 'O' : 'X'

        const res = verificaVitoria(jogo.tabuleiro)
        if (res) {
            jogo.terminou = true
            jogo.vencedor = res
        } else if (jogo.jogadas >= 9) {
            jogo.terminou = true
            jogo.vencedor = 'EMPATE'
        }

        return m.reply(`❌⭕ *JOGO DA VELHA*\n\n${tabuleiroTexto(jogo.tabuleiro)}\n\n${jogo.terminado ? `🏆 *${jogo.vencedor}*` : `👤 *Vez de ${jogo.jogador}*`}`)
    }
}

/** Desenha o tabuleiro. */
function tabuleiroTexto(tab) {
    let t = '```\n'
    for (let i = 0; i < 9; i += 3) {
        t += `${tab[i] || '·'} | ${tab[i + 1] || '·'} | ${tab[i + 2] || '·'}\n`
        if (i < 6) t += '--|-----|-----\n'
    }
    t += '```'
    return t
}

/** Verifica se alguém venceu. */
function verificaVitoria(tab) {
    const linhas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
    for (const [a, b, c] of linhas) {
        if (tab[a] && tab[a] === tab[b] && tab[a] === tab[c]) return tab[a]
    }
    return null
}

handler.help = ['encurtalink', 'getsite', 'gethtml', 'getquoted', 'getinfo', 'chance', 'conselhos', 'fatos', 'curiosidades', 'signo', 'idade', 'contador']
handler.tags = ['tools', 'utils']
handler.command = ['encurtalink', 'shorten', 'tinyurl', 'getsite', 'gethtml', 'getsitehtml', 'getquoted', 'mek',
    'divmsg', 'div', 'getinfo', 'getperfil', 'perfil', 'write', 'escrever', 'chance', 'probabilidade',
    'conselhos', 'conselhob', 'conselhosb', 'conselhobiblico', 'conselhosbiblico', 'fatos', 'curiosidades',
    'curiosidade', 'signo', 'idade', 'contador', 'counter', 'contadormsg', 'contagem', 'mecheck', 'checkme',
    'wame', 'velha', 'jogodavelha', 'jogov']

export default handler
