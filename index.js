/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project ༄ Đev Šoberano ×͜× - ANTI-CRASH SYSTEM
 *
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import { watchFile, unwatchFile, readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import yargs from 'yargs'
import lodash from 'lodash'
import chalk from 'chalk'
import pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import readline from 'readline'
import NodeCache from 'node-cache'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, generateWAMessageFromContent, downloadContentFromMessage } from '@whiskeysockets/baileys'
import qrcodeTerminal from 'qrcode-terminal'
import { temSessaoValida, verificarSessaoDisco, apagarSessao } from './lib/sessao.js'

// Cache de duplicidade para eventos de boas-vindas / saída
const welcomeEventCache = new Set()

// Registro do horário em que o bot ligou (para ignorar mensagens antigas/anteriores)
const botStartTime = Date.now()

// --- [ CONFIGURAÇÃO FIREBASE ] ---
import admin from 'firebase-admin'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let dbFirebase = { ref: () => ({ on: () => {}, update: () => {} }) };
try {
    const serviceAccount = require("./serviceAccountKey.json");
    if (!admin.apps.length) {
        admin.initializeApp({
         credential: admin.credential.cert(serviceAccount),
         databaseURL: "https://cybersoberano-default-rtdb.firebaseio.com"
        })
    }
    dbFirebase = admin.database()
} catch (e) {
    console.log(chalk.red.bold("\n[⚠️] FIREBASE: Erro nas credenciais."))
}
const msgRetryCounterCache = new NodeCache()
const { chain } = lodash
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
if (!global.opts['db']) global.opts['db'] = './src/database/database.json'
if (!global.isProtoInitialized) {
    try {
        protoType()
        serialize()
        global.isProtoInitialized = true
    } catch (e) {}
}
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
};
const __dirname = global.__dirname(import.meta.url)

const sessionPath = join(__dirname, global.GoticaSession || 'session')
if (!existsSync(sessionPath)) {
    mkdirSync(sessionPath, { recursive: true })
}

// --- [ INSTÂNCIA ÚNICA ] ---
const LOCK_FILE = join(sessionPath, '.bot.lock')
try {
    if (existsSync(LOCK_FILE)) {
        const lock = JSON.parse(readFileSync(LOCK_FILE, 'utf-8'))
        const vivo = lock.pid ? (() => {
            try { process.kill(lock.pid, 0); return true } catch { return false }
        })() : false

        if (vivo && lock.pid !== process.pid) {
            console.log(chalk.bgRed.white('\n [X] OUTRA INSTANCIA DO BOT JA ESTA RODANDO!'))
            console.log(chalk.red(`     PID: ${lock.pid} iniciada em ${new Date(lock.started).toLocaleString('pt-BR')}`))
            console.log(chalk.red('     Feche a outra janela antes de iniciar este.\n'))
            process.exit(1)
        }
    }
    writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, started: Date.now() }, null, 2))
} catch (e) {
    console.error('[LOCK] Erro ao verificar instância:', e.message)
}

const releaseLock = () => { try { if (existsSync(LOCK_FILE)) writeFileSync(LOCK_FILE, JSON.stringify({ pid: 0, started: 0 })) } catch { } }
process.on('exit', releaseLock)
process.on('SIGINT', () => { releaseLock(); process.exit(0) })
process.on('SIGTERM', () => { releaseLock(); process.exit(0) })

const dbPath = join(__dirname, 'src', 'database')
if (!existsSync(dbPath)) mkdirSync(dbPath, { recursive: true })
const databaseFile = join(dbPath, 'database.json')
global.db = new Low(new JSONFile(databaseFile))
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return
    await global.db.read().catch(console.error)
    global.db.data = {
        users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {},
        ...(global.db.data || {})
    }
    global.db.chain = lodash.chain(global.db.data)
}
await global.loadDatabase()
console.clear()
cfonts.say('Gotica Bot', { font: 'chrome', align: 'center', gradient: ['#ff4fcb', '#ff77ff'] })
cfonts.say('feito por: Dev Soberano', { font: 'console', align: 'center', colors: ['cyan'] })

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
const { version } = await fetchLatestBaileysVersion();
console.log(chalk.cyan(`📱 Usando versão do WhatsApp: ${version.join('.')}`))

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
let usePairingCode = false
let phoneNumber = ''

const sessaoSalva = verificarSessaoDisco(sessionPath)
const jaConectado = sessaoSalva.valida || temSessaoValida(state.creds)

if (jaConectado) {
    const num = sessaoSalva.meId || state.creds?.me?.id || ''
    console.log(chalk.bgGreen.black.bold(`\n [✓] SESSÃO ENCONTRADA - conectando automaticamente`))
    if (num) console.log(chalk.gray(`     Bot: ${num.split(':')[0]}`))
} else {
    const opcao = await question(chalk.bold.cyan("\n[?] Escolha o método de conexão:\n1. QR Code (Terminal)\n2. Código de Pareamento (Número)\n---> "))
    usePairingCode = opcao.trim() === '2'

    if (usePairingCode) {
        phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`\n✦ Digite o número com DDD:\n---> `)))
        phoneNumber = phoneNumber.replace(/\D/g, '')
    }
}

const logger = pino({
    level: 'fatal',
    hooks: {
        logMethod(inputArgs, method) {
            const msg = inputArgs.join(' ');
            if (msg.includes('Bad MAC') || msg.includes('Failed to decrypt') || msg.includes('Session error')) {
                return;
            }
            return method.apply(this, inputArgs);
        }
    }
});

const baseKeyStore = makeCacheableSignalKeyStore(state.keys, logger);
const safeSignalKeyStore = {
    ...baseKeyStore,
    get: async (type, ids) => {
        try {
            return await baseKeyStore.get(type, ids);
        } catch (e) {
            return {};
        }
    },
    set: async (data) => {
        try {
            return await baseKeyStore.set(data);
        } catch (e) {
            return;
        }
    }
};

const connectionOptions = {
    logger,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
        creds: state.creds,
        keys: safeSignalKeyStore,
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    printQRInTerminal: false,
    msgRetryCounterCache,
    version,
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 2500,
    generateHighQualityLinkPreview: true,
    shouldIgnoreJid: (jid) => jid?.endsWith('@newsletter') || jid?.includes('status@broadcast'),
    patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage
        );
        if (requiresPatch) {
            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2,
                        },
                        ...message,
                    },
                },
            };
        }
        return message;
    },
}
global.conn = makeWASocket(connectionOptions);

// --- [ CÓDIGO DE PAREAMENTO ] ---
// Pede o código direto (sem depender do evento connection.update, que
// podia disparar ANTES de os listeners serem registrados, por causa do
// carregamento dos plugins). Tenta até 3 vezes caso o socket ainda não
// esteja pronto.
async function solicitarCodigoPareamento(tentativa = 1) {
    const c = global.conn
    if (!usePairingCode || !phoneNumber || !c) return
    if (c.authState?.creds?.registered) return
    if (tentativa === 1 && c.pairingCodeRequested) return
    c.pairingCodeRequested = true

    await new Promise(r => setTimeout(r, 3000))
    if (c !== global.conn) return // socket foi trocado (reconexão), o novo cuida disso
    if (c.authState?.creds?.registered) return

    try {
        let code = await c.requestPairingCode(phoneNumber)
        code = code?.match(/.{1,4}/g)?.join("-") || code
        console.log(chalk.bold.white(chalk.bgMagenta(`\n✧ SEU CÓDIGO É: ${code} ✧\n`)))
    } catch (err) {
        console.log(chalk.red(`\n[❌] Erro ao solicitar código de pareamento (tentativa ${tentativa}/3): ${err?.message || err}`))
        if (tentativa < 3) return solicitarCodigoPareamento(tentativa + 1)
        c.pairingCodeRequested = false
    }
}

let handler = await import('./handler.js')
let isReconnecting = false
let reconnectAttempts = 0
let reconnectTimer = null
const RECONNECT_BASE_DELAY_MS = 2000
const RECONNECT_MAX_DELAY_MS = 30000

function scheduleReconnect() {
    if (reconnectTimer) return
    const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts),
        RECONNECT_MAX_DELAY_MS
    )
    reconnectAttempts++
    console.log(chalk.yellow(`[!] Reconectando em ${Math.round(delay / 1000)}s (tentativa ${reconnectAttempts})...`))
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        global.reloadHandler(true)
    }, delay)
}

const limparNum = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

// --- Botão de canal (mesmo padrão usado nos outros plugins: antilink,
// antipagamento, antifake toggle) — usado pelo anti-fake de entrada pra
// avisar o estrangeiro ANTES de banir, com botão do canal junto. ---
function buildInteractiveNodes(chatId) {
    const nodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                    ]
                }
            ]
        }
    ]
    if (!chatId.endsWith('@g.us')) {
        nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
    }
    return nodes
}

async function sendComBotaoAntiFake(conn, chatId, texto, mentions) {
    const interactiveMessage = {
        ...(mentions ? { contextInfo: { mentionedJid: mentions } } : {}),
        body: { text: texto },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
                        url: global.canal || "https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K"
                    })
                }
            ]
        }
    }
    try {
        const msgi = generateWAMessageFromContent(chatId, { interactiveMessage }, { userJid: conn.user.id })
        await conn.relayMessage(chatId, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(chatId)
        })
    } catch (e) {
        console.error('[ANTI-FAKE] Erro ao enviar aviso com botão, caindo pro texto simples:', e)
        await conn.sendMessage(chatId, { text: texto, mentions }).catch(() => {})
    }
}

// ───────────────────────── 🗑️ ANTI-DELETE ─────────────────────────
// Cache simples em memória: guarda o conteúdo (texto ou mídia) de cada
// mensagem recente de grupo, só enquanto o antidelete estiver ativo
// naquele grupo. Quando chega um "apagar para todos" (protocolMessage
// tipo REVOKE), reenvia o que tinha guardado antes de expirar.
global.antideleteCache = global.antideleteCache || new Map()
const ANTIDELETE_TTL_MS = 20 * 60 * 1000 // 20 minutos
const ANTIDELETE_MAX_ITENS = 500 // limite pra não estourar memória em grupo muito ativo

function antideleteChaveCache(chatJid, id) {
    return `${chatJid}::${id}`
}

function antideleteGuardar(chave, dado) {
    if (global.antideleteCache.size >= ANTIDELETE_MAX_ITENS) {
        const primeiraChave = global.antideleteCache.keys().next().value
        if (primeiraChave) global.antideleteCache.delete(primeiraChave)
    }
    global.antideleteCache.set(chave, dado)
    setTimeout(() => global.antideleteCache.delete(chave), ANTIDELETE_TTL_MS)
}

function antideleteLerConfigGrupo(chatJid) {
    try {
        const cleanFrom = chatJid.split('@')[0] + '@g.us'
        const caminhoGotica = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
        if (!existsSync(caminhoGotica)) return {}
        const rawData = JSON.parse(readFileSync(caminhoGotica, 'utf-8'))
        return Array.isArray(rawData) ? (rawData[0] || {}) : (rawData || {})
    } catch (e) {
        return {}
    }
}

const ANTIDELETE_MEDIA_TYPES = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    stickerMessage: 'sticker',
}
const ANTIDELETE_MAX_MEDIA_BYTES = 12 * 1024 * 1024 // 12MB, pra não pesar demais no cache

async function antideleteBaixarMidia(mediaMsg, tipo) {
    const stream = await downloadContentFromMessage(mediaMsg, tipo)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
        if (buffer.length > ANTIDELETE_MAX_MEDIA_BYTES) return null // mídia grande demais, não cacheia
    }
    return buffer
}

async function processarAntiDelete(msg) {
    const chatJid = msg?.key?.remoteJid
    if (!chatJid || !chatJid.endsWith('@g.us')) return
    if (!msg.message) return

    const cfg = antideleteLerConfigGrupo(chatJid)
    if (cfg.antidelete !== true) return

    // --- Caso 1: é um evento de "apagar para todos" ---
    const protocolType = msg.message?.protocolMessage?.type
    if (protocolType === 0) { // 0 = REVOKE
        const revokedKey = msg.message.protocolMessage.key
        if (!revokedKey?.id) return

        const chave = antideleteChaveCache(chatJid, revokedKey.id)
        const cached = global.antideleteCache.get(chave)
        if (!cached) return // não tínhamos guardado essa mensagem, nada a fazer

        global.antideleteCache.delete(chave)

        const quemApagou = msg.participant || msg.key?.participant || msg.key?.remoteJid
        const quemMandou = cached.sender
        const quemApagouLimpo = limparNum(quemApagou)
        const quemMandouLimpo = limparNum(quemMandou)

        const mentions = [...new Set([quemApagou, quemMandou].filter(Boolean))]
        const cabecalho =
            `\`🗑️ ANTI-DELETE\`\n\n` +
            `> Mensagem apagada por: @${quemApagouLimpo}\n`

        try {
            if (cached.mediaBuffer) {
                await global.conn.sendMessage(chatJid, {
                    [cached.mediaTipo === 'sticker' ? 'sticker' : cached.mediaTipo]: cached.mediaBuffer,
                    ...(cached.mediaTipo !== 'sticker' ? { caption: `${cabecalho}\n${cached.texto || ''}`.trim(), mentions } : {}),
                    ptt: cached.mediaTipo === 'audio' ? cached.ptt : undefined
                }).catch(() => {})
                if (cached.mediaTipo === 'sticker' && cached.texto) {
                    await global.conn.sendMessage(chatJid, { text: `${cabecalho}\n${cached.texto}`.trim(), mentions }).catch(() => {})
                } else if (cached.mediaTipo === 'sticker') {
                    await global.conn.sendMessage(chatJid, { text: cabecalho.trim(), mentions }).catch(() => {})
                }
            } else {
                const texto = `${cabecalho}\n${cached.texto || '_(sem texto, era um tipo de mídia não suportado pelo cache)_'}`.trim()
                await sendComBotaoAntiFake(global.conn, chatJid, texto, mentions)
            }
        } catch (e) {
            console.error('[ANTI-DELETE] Falha ao reenviar:', e)
        }
        return
    }

    // --- Caso 2: mensagem normal — cacheia pro caso de ser apagada depois ---
    if (msg.key?.fromMe) return
    if (!msg.key?.id) return

    const texto =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''

    let mediaTipo = null
    let mediaMsg = null
    for (const campo in ANTIDELETE_MEDIA_TYPES) {
        if (msg.message?.[campo]) {
            mediaTipo = ANTIDELETE_MEDIA_TYPES[campo]
            mediaMsg = msg.message[campo]
            break
        }
    }

    let mediaBuffer = null
    let ptt = false
    if (mediaMsg && mediaTipo) {
        try {
            mediaBuffer = await antideleteBaixarMidia(mediaMsg, mediaTipo)
            if (mediaTipo === 'audio') ptt = !!mediaMsg.ptt
        } catch (e) {
            mediaBuffer = null
        }
    }

    const chave = antideleteChaveCache(chatJid, msg.key.id)
    antideleteGuardar(chave, {
        sender: msg.key.participant || msg.participant || chatJid,
        texto,
        mediaTipo,
        mediaBuffer,
        ptt
    })
}

global.reloadHandler = async function (restatConn) {
    if (restatConn) {
        if (isReconnecting) {
            console.log(chalk.yellow("[!] Reconexão já em andamento, ignorando pedido duplicado."))
            return true
        }
        isReconnecting = true
        try { global.conn.ws.close() } catch { }
        global.conn = makeWASocket(connectionOptions)
    }

    if (typeof global.conn.handler === 'function') {
        global.conn.ev.off('messages.upsert', global.conn.handler)
    }
    if (typeof global.conn.participantsUpdate === 'function') {
        global.conn.ev.off('group-participants.update', global.conn.participantsUpdate)
    }
    if (typeof global.conn.connectionUpdate === 'function') {
        global.conn.ev.off('connection.update', global.conn.connectionUpdate)
    }
    if (typeof global.conn.credsUpdate === 'function') {
        global.conn.ev.off('creds.update', global.conn.credsUpdate)
    }
    if (typeof global.conn.callHandler === 'function') {
        global.conn.ev.off('call', global.conn.callHandler)
    }

    if (global.conn.antiRouboHandler) {
        global.conn.ev.off('group-participants.update', global.conn.antiRouboHandler);
    }

    // --- [ SISTEMA ANTI-ROUBO DE GRUPO ] ---
    global.conn.antiRouboHandler = async (event) => {
        try {
            const { id: chatId, participants, action, author } = event;
            if (!chatId?.endsWith('@g.us')) return;
            if (action !== 'promote' && action !== 'demote') return;
            if (!author) return;

            const caminhoAntigo = `./DADOS DA GOTICA/grupos/ATIVAÇÕES-GOTICA/${chatId}.json`;
            const caminhoGotica = `./src/database/grupos/${chatId}.json`;
            let caminho = existsSync(caminhoGotica) ? caminhoGotica : caminhoAntigo;
            if (!existsSync(caminho)) return;

            const jsonGp = JSON.parse(readFileSync(caminho));
            const config = Array.isArray(jsonGp) ? jsonGp[0] : jsonGp;
            if (!config?.antiroubo || !config.antiroubo.active) return;

            let grpmdt;
            try { grpmdt = await global.conn.groupMetadata(chatId) } catch { return }
            if (!grpmdt?.id.endsWith('@g.us')) return;

            const membros_ = grpmdt.participants || [];

            const extrairId = (p) => {
                if (!p) return null;
                if (typeof p === 'string') return p;
                if (typeof p === 'object') return p.id || p.jid || p.phoneNumber || null;
                return null;
            };
            const normalizar = (alvo) => {
                if (!alvo || typeof alvo !== 'string') return alvo;
                if (alvo.includes('@lid') && membros_) {
                    const lidBase = alvo.split(':')[0] + '@lid';
                    const encontrado = membros_.find(v => v.lid === lidBase)?.jid || membros_.find(v => v.lid === lidBase)?.id;
                    return encontrado || alvo;
                }
                return alvo;
            };

            const alvoRaw = extrairId(participants?.[0]);
            const alvo = normalizar(alvoRaw);
            const quemExecutou = normalizar(extrairId(author) || author);

            if (!alvo || !quemExecutou) return;

            const botNum = global.conn.user?.id?.split(':')[0]?.split('@')[0];
            const selfIds = new Set();
            if (botNum) {
                for (const p of membros_) {
                    const candidatos = [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean);
                    const bate = candidatos.some(c => String(c).split(':')[0].split('@')[0] === botNum);
                    if (bate) candidatos.forEach(c => selfIds.add(c));
                }
            }
            const ehSelf = (id) => {
                if (!id) return false;
                if (selfIds.has(id)) return true;
                const numOnly = String(id).split(':')[0].split('@')[0];
                for (const s of selfIds) {
                    if (String(s).split(':')[0].split('@')[0] === numOnly) return true;
                }
                return false;
            };

            if (ehSelf(quemExecutou) || ehSelf(alvo)) return;

            const permitidos = config.antiroubo.permitidos || [];
            const donosNumeros = (Array.isArray(global.owner) ? global.owner : [])
                .map(o => String(o[0] || '').replace(/\D/g, ''))
                .filter(Boolean);

            const quemExecutouNum = quemExecutou.split(':')[0].split('@')[0].replace(/\D/g, '');
            const isPermitido =
                donosNumeros.includes(quemExecutouNum) ||
                permitidos.includes(quemExecutou) ||
                permitidos.includes(quemExecutouNum);

            if (isPermitido) return;

            if (/:[0-9]+@lid$/.test(alvo) || /:[0-9]+@lid$/.test(quemExecutou)) {
                console.log('[ANTI-ROUBO] JID não resolvido corretamente, ignorando ação para evitar erro.');
                return;
            }

            const acaoTexto = action === 'promote' ? 'promover' : 'rebaixar';
            const acaoRevertida = action === 'promote' ? 'promovido' : 'rebaixado';

            let sucessoAlvo = false;
            let sucessoExecutor = false;
            try {
                const acaoReverter = action === 'promote' ? 'demote' : 'promote';
                await global.conn.groupParticipantsUpdate(chatId, [alvo], acaoReverter);
                sucessoAlvo = true;
            } catch (e) {
                console.log('[ANTI-ROUBO] Falha ao reverter alvo:', e.message);
            }

            await new Promise(r => setTimeout(r, 1200));

            try {
                await global.conn.groupParticipantsUpdate(chatId, [quemExecutou], 'demote');
                sucessoExecutor = true;
            } catch (e) {
                console.log('[ANTI-ROUBO] Falha ao punir executor:', e.message);
            }

            const avisoFalha = (!sucessoAlvo || !sucessoExecutor)
                ? '\n\n⚠️ Uma das ações de correção falhou (verifique se ainda sou admin do grupo).'
                : '';

            const msgAlerta = `*🔒 𝐀𝐍𝐓𝐈-𝐑𝐎𝐔𝐁𝐎 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎 🔒*\n*ᴀᴄ̧ᴀ̃ᴏ ʙʟᴏǫᴜᴇᴀᴅᴀ!*\n*ᴏ ᴀᴅᴍ @${quemExecutou.split('@')[0]} ᴛᴇɴᴛᴏᴜ ${acaoTexto} @${alvo.split('@')[0]} sᴇᴍ ᴘᴇʀᴍɪssᴀ̃ᴏ.*\n*ᴀᴄᴀᴏ: ${acaoRevertida} ʀᴇᴠᴇʀᴛɪᴅᴏ ᴇ ᴇxᴇᴄᴜᴛᴏʀ ʀᴇʙᴀɪxᴀᴅᴏ.*${avisoFalha}\n> _Apenas admins autorizados podem promover/rebaixar neste grupo._`;

            await global.conn.sendMessage(chatId, {
                text: msgAlerta,
                mentions: [quemExecutou, alvo]
            }).catch(() => {});

        } catch (e) {
            console.log('[ANTI-ROUBO] Erro geral:', e);
        }
    };

    global.conn.ev.on('group-participants.update', global.conn.antiRouboHandler);

    const currentHandler = handler.handler || handler.default?.handler || handler.default || handler;
    global.conn.handler = async (chatUpdate) => {
        try {
            if (chatUpdate.messages && chatUpdate.messages.length > 0) {
                chatUpdate.messages = chatUpdate.messages.filter(msg => {
                    const msgTime = (msg.messageTimestamp || 0) * 1000;
                    if (msgTime > 0 && msgTime < botStartTime) {
                        return false;
                    }
                    return true;
                });
                if (chatUpdate.messages.length === 0) return;
            }

            // --- 🗑️ ANTI-DELETE (cacheia + detecta revoke) ---
            // Fica ANTES do dispatch pro handler.js de propósito: olha a
            // mensagem bruta assim que chega, cacheia o conteúdo (texto ou
            // mídia) enquanto o grupo tiver antidelete ativo, e quando
            // chega um evento de "apagar para todos" (protocolMessage tipo
            // REVOKE), reenvia o que tinha guardado. Não depende do
            // handler.js nem do sistema de plugins — roda direto aqui,
            // igual o anti-fake, pra não correr o risco de o dispatcher
            // filtrar/ignorar mensagens do tipo protocolMessage.
            if (chatUpdate.messages && chatUpdate.messages.length > 0) {
                for (const msg of chatUpdate.messages) {
                    await processarAntiDelete(msg).catch(e => console.error('[ANTI-DELETE] Erro:', e))
                }
            }

            await currentHandler.call(global.conn, chatUpdate)
        } catch (e) {
            console.error(e)
        }
    }

    // --- [ 📵 ANTI-CALL ] ---
    // Sempre rejeita QUALQUER ligação recebida (evita problema na conta
    // do bot — WhatsApp pode banir número que não atende/recusa chamadas
    // automaticamente). Além disso, em todo grupo onde o anticall estiver
    // ativo E a pessoa que ligou for membro, remove ela do grupo.
    global.conn.callHandler = async (calls) => {
        try {
            for (const call of calls) {
                if (call.status !== 'offer') continue // só processa a ligação chegando, não os status seguintes (timeout, reject, etc)

                const callerId = call.from || call.peerJid || call.chatId
                if (!callerId) continue

                // PASSO 1: sempre rejeita a ligação
                try {
                    await global.conn.rejectCall(call.id, callerId)
                } catch (e) {
                    console.error('[ANTI-CALL] Falha ao rejeitar ligação:', e.message)
                }

                console.log(chalk.red.bold(`[ANTI-CALL] Ligação recebida e rejeitada de ${limparNum(callerId)}`))

                // PASSO 2: checa em quais grupos (com anticall ativo) a
                // pessoa está, e remove dos que tiverem a proteção ligada
                try {
                    const callerClean = limparNum(callerId)
                    const todosGrupos = await global.conn.groupFetchAllParticipating().catch(() => ({}))

                    for (const grupoId in todosGrupos) {
                        const grupo = todosGrupos[grupoId]
                        const listaMembros = grupo?.participants || []

                        const estaNoGrupo = listaMembros.some(p => {
                            const ids = [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limparNum)
                            return ids.includes(callerClean)
                        })
                        if (!estaNoGrupo) continue

                        const cfg = antideleteLerConfigGrupo(grupoId) // leitor genérico do arquivo físico do grupo
                        if (cfg.anticall !== true) continue

                        console.log(chalk.red.bold(`[ANTI-CALL] Removendo ${callerClean} de ${grupoId} por fazer ligação`))

                        const texto = `\`📵 ANTI-CALL\`\n\n> @${callerClean} foi removido por fazer ligação. 🚫`
                        await sendComBotaoAntiFake(global.conn, grupoId, texto, [callerId]).catch(() => {})
                        await global.conn.groupParticipantsUpdate(grupoId, [callerId], 'remove').catch(() => {})
                    }
                } catch (e) {
                    console.error('[ANTI-CALL] Erro ao checar/remover dos grupos:', e)
                }
            }
        } catch (e) {
            console.error('[ANTI-CALL] Erro geral:', e)
        }
    }

    // --- [ MANIPULADOR DE ENTRADA, SAÍDA E ANTI-FAKE EXCLUSIVO NA ENTRADA ] ---
    global.conn.participantsUpdate = async (update) => {
        try {
            const { id: grupoId, participants, action } = update
            if (!grupoId || !grupoId.endsWith('@g.us') || !participants || !participants.length) return

            const cleanFrom = grupoId.split('@')[0] + '@g.us'
            const caminhoGotica = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
            const caminhoLegado = join(process.cwd(), 'DADOS DA GOTICA', 'grupos', 'ATIVAÇÕES-GOTICA', `${cleanFrom}.json`)

            let filePath = existsSync(caminhoGotica) ? caminhoGotica : (existsSync(caminhoLegado) ? caminhoLegado : null)
            let jsonGp = {}

            if (filePath) {
                try {
                    const rawData = JSON.parse(readFileSync(filePath, 'utf-8'))
                    jsonGp = Array.isArray(rawData) ? (rawData[0] || {}) : rawData
                } catch (e) {}
            }

// --- 🌍 ANTI-FAKE EXCLUSIVO NA ENTRADA (Apenas no evento 'add') ---
            // Trava de segurança: um evento 'add' com MUITOS participantes
            // de uma vez não é uma entrada real de alguém no grupo — é
            // sinal de resincronização/snapshot da lib (acontece ao
            // reconectar). Nessa situação a gente NÃO bane ninguém, senão
            // corre o risco de expulsar gente que já estava no grupo antes
            // de o antifake ser ligado.
            const SYNC_BATCH_LIMIT = 5
            if (action === 'add' && jsonGp.antifake === true) {
                if (participants.length > SYNC_BATCH_LIMIT) {
                    console.log(chalk.yellow(`[ANTI-FAKE] Ignorando evento 'add' com ${participants.length} participantes de uma vez em ${grupoId} (provável resincronização, não entrada real).`))
                } else {
                    // O WhatsApp agora costuma reportar quem entra usando um
                    // @lid (identificador de privacidade) em vez do número
                    // de telefone direto, principalmente pra quem não é
                    // contato salvo — exatamente o caso de um estrangeiro
                    // entrando pela primeira vez. Pra conseguir ler o DDI
                    // (código do país) a gente precisa resolver esse @lid
                    // pro JID real usando os metadados do grupo.
                    const precisaResolverLid = participants.some(p => {
                        const id = typeof p === 'string' ? p : (p?.id || p?.jid)
                        return id && String(id).includes('@lid')
                    })

                    // Tenta resolver @lid -> número real de 3 formas, na
                    // ordem: (1) o mapeamento interno do próprio Baileys
                    // (ele PRECISA saber o número real pra conseguir
                    // criptografar/rotear as mensagens, então geralmente
                    // tem isso guardado mesmo sem o contato salvo); (2) os
                    // metadados do grupo, olhando todos os campos possíveis
                    // (id/jid/lid/phoneNumber), com uma nova tentativa após
                    // um pequeno delay caso o cache ainda esteja desatualizado
                    // bem no instante da entrada.
                    let metaParaResolverLid = precisaResolverLid
                        ? await global.conn.groupMetadata(grupoId).catch(() => null)
                        : null

                    const buscarNosMetadados = (lidBase) => {
                        if (!metaParaResolverLid?.participants) return null
                        const encontrado = metaParaResolverLid.participants.find(v => {
                            const candidatos = [v.id, v.jid, v.lid, v.phoneNumber].filter(Boolean).map(String)
                            return candidatos.includes(lidBase)
                        })
                        if (!encontrado) return null
                        const reais = [encontrado.jid, encontrado.phoneNumber, encontrado.id].filter(Boolean).map(String)
                        return reais.find(c => !c.includes('@lid')) || null
                    }

                    const resolverLidParaJid = async (lidRaw) => {
                        // Normaliza: tira sufixo de dispositivo (:12) e
                        // qualquer @lid/@s.whatsapp.net já existente antes
                        // de colar o @lid de volta — sem isso, virava
                        // "numero@lid@lid" e nunca batia com nada.
                        const lidBase = String(lidRaw).split(':')[0].replace(/@lid$/i, '').replace(/@s\.whatsapp\.net$/i, '') + '@lid'

                        // (1) mapeamento interno do Baileys, se o fork expuser
                        try {
                            const mapping = global.conn?.signalRepository?.lidMapping
                            if (mapping?.getPNForLID) {
                                const pn = await mapping.getPNForLID(lidBase)
                                if (pn) return String(pn).includes('@') ? pn : pn + '@s.whatsapp.net'
                            }
                        } catch (e) {}

                        // (2) metadados do grupo já carregados
                        let achado = buscarNosMetadados(lidBase)
                        if (achado) return achado

                        // (3) refaz a busca dos metadados uma vez (cache pode
                        // estar desatualizado bem no instante da entrada)
                        await new Promise(r => setTimeout(r, 1200))
                        metaParaResolverLid = await global.conn.groupMetadata(grupoId).catch(() => metaParaResolverLid)
                        achado = buscarNosMetadados(lidBase)
                        if (achado) return achado

                        return null
                    }

                    for (let participante of participants) {
                        let rawId = typeof participante === 'string' ? participante : (participante?.id || participante?.jid);
                        if (!rawId || String(rawId).endsWith('@g.us')) continue;

                        let userJid = rawId
                        if (String(rawId).includes('@lid')) {
                            const resolvido = await resolverLidParaJid(rawId)
                            if (!resolvido) {
                                // Não conseguiu descobrir o número real por
                                // trás do @lid — não dá pra saber o país,
                                // então não arrisca banir errado.
                                console.log(chalk.yellow(`[ANTI-FAKE] Não consegui resolver o @lid ${rawId} para um número real em ${grupoId}, ignorando.`))
                                continue
                            }
                            userJid = resolvido
                        }

                        const userNum = limparNum(userJid)

                        // Valida se é um número de telefone real (entre 10 e 15 dígitos)
                        if (userNum && userNum.length >= 10 && userNum.length <= 15) {
                            // Se for estrangeiro (NÃO começa com 55), expulsa imediatamente ao entrar
                            if (!userNum.startsWith('55')) {
                                console.log(chalk.red.bold(`[ANTI-FAKE ENTRADA] Banindo estrangeiro ${userNum} de ${grupoId}`))

                                const userJidFinal = userJid.includes('@') ? userJid : userJid + '@s.whatsapp.net'

                                // PASSO 1: avisa primeiro, com botão do canal,
                                // pra pessoa ver o motivo antes de ser banida
                                const textoFake = `*🌍 ANTI-FAKE*\n\n> @${userNum} será removido por entrar com número estrangeiro (fora do Brasil +55). 🚫\n\n_Apenas números com DDI +55 (Brasil) podem participar deste grupo._`
                                await sendComBotaoAntiFake(global.conn, grupoId, textoFake, [userJidFinal])

                                // PASSO 2: bane (usa o rawId original pro
                                // remove, pois a API aceita tanto @lid
                                // quanto o jid normal)
                                await global.conn.groupParticipantsUpdate(grupoId, [rawId], 'remove').catch(() => {})
                            }
                        }
                    }
                }
            }

            if (action !== 'add' && action !== 'remove' && action !== 'leave') return

            const wl0 = Array.isArray(jsonGp.wellcome) ? jsonGp.wellcome[0] : (jsonGp.wellcome || {})

            const isWelcomeEnabled = jsonGp.bemvindo === true || wl0.bemvindo1 === true || wl0.wellcome === true || jsonGp.welcome === true
            const isExitEnabled = jsonGp.exit?.enabled === true || jsonGp.bemvindo === true || wl0.bemvindo1 === true || wl0.legendasaiu != null || jsonGp.legendasaida != null || jsonGp.exit?.text != null

            if (action === 'add' && !isWelcomeEnabled) return
            if ((action === 'remove' || action === 'leave') && !isExitEnabled) return

            let mdata = await global.conn.groupMetadata(grupoId).catch(() => ({}))
            const subject = mdata.subject || 'Grupo'
            const desc = mdata.desc || ''

            for (let participante of participants) {
                let rawId = typeof participante === 'string' ? participante : (participante?.id || participante?.jid);
                if (!rawId) continue;

                const userJid = rawId.includes('@') ? rawId : rawId + '@s.whatsapp.net'
                const userNumber = userJid.split('@')[0]

                const cacheKey = `${grupoId}_${userJid}_${action}`
                if (welcomeEventCache.has(cacheKey)) continue
                welcomeEventCache.add(cacheKey)
                setTimeout(() => welcomeEventCache.delete(cacheKey), 5000)

                const formatMessageText = (txt) => {
                    if (!txt) return ''
                    return txt
                        .replace(/#nomedogp#/g, subject)
                        .replace(/#numerodele#/g, `@${userNumber}`)
                        .replace(/#descrição#/g, desc)
                        .replace(/@user/g, `@${userNumber}`)
                        .replace(/@subject/g, subject)
                }

                const isWelcome = action === 'add';

                const defaultText = isWelcome ?
                    (jsonGp.textbv || wl0.legendabv ? (jsonGp.textbv || wl0.legendabv) : "✨ *Seja bem-vindo(a),* #numerodele#!\n\n📋 *Apresente-se com:*\n📝 *Nome:*\n📸 *Foto:*\n🎂 *Idade:*\n\n⚠️ *AVISO:* Siga as regras, e Se flodar links aqui ja pode esperar o pior para o seu grupo! 😉👊") :
                    (jsonGp.exit && jsonGp.exit.text ? jsonGp.exit.text : (wl0.legendasaiu || "╭━⊱ 👋 *ATÉ LOGO!* 👋 ⊱━╮\n│\n│ 👤 #numerodele#\n│\n│ 🚪 Saiu do grupo\n│ *#nomedogp#*\n│\n╰━━━━━━━━━━━━━━━━━━╯"));

                const text = formatMessageText(defaultText);

                let profilePicUrl = 'https://raw.githubusercontent.com/nazuninha/uploads/main/outros/1747053564257_bzswae.bin';
                try {
                    const pp = await global.conn.profilePictureUrl(userJid, 'image');
                    if (pp) profilePicUrl = pp;
                } catch {
                    const fallbackLocalPath = join(process.cwd(), 'media', 'neutra.jpg');
                    if (existsSync(fallbackLocalPath)) {
                        profilePicUrl = fallbackLocalPath;
                    }
                }

                const mentions = [userJid];

                let msgObject = {
                    image: profilePicUrl.startsWith('http') ? { url: profilePicUrl } : readFileSync(profilePicUrl),
                    caption: text,
                    mentions: mentions,
                    contextInfo: {
                        mentionedJid: mentions,
                        isForwarded: true,
                        forwardingScore: 1,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.canalJid,
                            newsletterName: global.canalNome,
                            serverMessageId: 0
                        }
                    }
                };

                await global.conn.sendMessage(grupoId, msgObject).catch(async (e) => {
                    console.error('[ERRO AO ENVIAR WELCOME/EXIT]:', e);
                });
            }
        } catch (e) {
            console.error('[PARTICIPANTS UPDATE ERROR]:', e)
        }
    }

    global.conn.connectionUpdate = async (update) => {
        const { connection, lastDisconnect, qr } = update

        // Fallback: se o código ainda não foi pedido, pede agora
        if (usePairingCode && !global.conn.authState.creds.registered && (qr || connection === 'connecting')) {
            solicitarCodigoPareamento()
        }

        const sessaoOk = temSessaoValida(global.conn.authState?.creds)
        if (qr && !usePairingCode && !sessaoOk) {
            console.log(chalk.bold.yellow("\n[!] Escaneie o QR Code abaixo para conectar:"))
            try {
                qrcodeTerminal.generate(qr, { small: true })
            } catch (err) {
                console.log(chalk.gray(`QR Data: ${qr}`))
            }
        }
        if (connection == 'open') {
            console.log(chalk.bold.green('\n[SUCCESS] ༄ Đev Šoberano ×͜× | Bot Online!'))
            isReconnecting = false
            reconnectAttempts = 0
        }

        if (connection === 'close') {
            const boomError = new Boom(lastDisconnect?.error)
            const reason = boomError?.output?.statusCode
            console.log(chalk.red(`\n[!] Conexão fechada. Razão: ${reason}`))
            isReconnecting = false

            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.bgRed.white(" [!] SESSÃO DESLOGADA. Apague a pasta de sessão e escaneie novamente. "))
                return
            }
            scheduleReconnect()
        }
    }

    global.conn.credsUpdate = saveCreds.bind(global.conn)

    global.conn.ev.on('messages.upsert', global.conn.handler)
    global.conn.ev.on('group-participants.update', global.conn.participantsUpdate)
    global.conn.ev.on('connection.update', global.conn.connectionUpdate)
    global.conn.ev.on('creds.update', global.conn.credsUpdate)
    global.conn.ev.on('call', global.conn.callHandler)

    // Se for reconexão (novo socket), garante o pedido do código também
    if (restatConn) solicitarCodigoPareamento()
    return true
};

process.on('uncaughtException', function (err) {
    const msg = err?.message || String(err);
    if (err.code === 'ENOENT' && err.path?.includes('creds.json')) return;
    if (msg.includes('Cannot redefine property')) return;
    if (msg.includes('Connection Closed') || msg.includes('428')) return;
    if (msg.includes('Bad MAC') || msg.includes('Failed to decrypt') || msg.includes('Session error')) return;
    console.error('ERRO CRÍTICO NO SISTEMA:', err);
});

process.on('unhandledRejection', function (reason) {
    const msg = String(reason);
    if (msg.includes('Bad MAC') || msg.includes('Failed to decrypt') || msg.includes('Session error')) return;
});

const pluginFolder = join(__dirname, 'plugins')
global.plugins = {}
async function loadPlugins() {
    let loadErrors = 0
    for (const filename of readdirSync(pluginFolder).filter(f => f.endsWith('.js'))) {
        const file = join(pluginFolder, filename)
        try {
            const fileUrl = pathToFileURL(file).href
            const module = await import(fileUrl + '?update=' + Date.now())
            global.plugins[filename] = module.default || module
        } catch (e) {
            loadErrors++
            console.error(chalk.redBright(`[PLUGIN ERROR] ${filename}:`), e.message)
        }
        unwatchFile(file)
        watchFile(file, async () => {
            try {
                const fileUrl = pathToFileURL(file).href
                const module = await import(fileUrl + '?update=' + Date.now())
                global.plugins[filename] = module.default || module
            } catch (e) {
                console.error(chalk.redBright(`[PLUGIN ERROR] ${filename}:`), e.message)
            }
        })
    }
    const total = readdirSync(pluginFolder).filter(f => f.endsWith('.js')).length
    if (loadErrors) {
        console.error(chalk.redBright(`[PLUGINS] ${loadErrors} de ${total} plugins falharam ao carregar.`))
    } else {
        console.log(chalk.greenBright(`[PLUGINS] ${total} plugins carregados com sucesso.`))
    }
}

const handlerPath = join(__dirname, 'handler.js')
unwatchFile(handlerPath)
watchFile(handlerPath, async () => {
    try {
        const freshHandler = await import(`./handler.js?update=${Date.now()}`)
        handler = freshHandler
        await global.reloadHandler(false)
    } catch (e) { }
})

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.redBright("Atualizado 'index.js'"))
    import(pathToFileURL(file).href + `?update=${Date.now()}`)
})

await loadPlugins()
await global.reloadHandler(false)

// Pedido direto do código de pareamento (não depende de nenhum evento)
await solicitarCodigoPareamento()