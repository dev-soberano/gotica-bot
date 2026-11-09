const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

// Definições globais para evitar erros de "not defined"
if (!global.jadi) global.jadi = 'jadibots' 
if (!global.conns) global.conns = []

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "*\n\n✐ Cσɳҽxισɳ SυႦ-Bσƚ Mσԃҽ QR\n\n✰ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n\`1\` » Haga clic en los tres puntos en la esquina superior derecha\n\n\`2\` » Toque dispositivos vinculados\n\n\`3\` » Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RubyJBOptions = {}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // Inicializa a variável Subs se não existir
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    if (!global.db.data.users[m.sender].Subs) global.db.data.users[m.sender].Subs = 0
    
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date() - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)

    const limiteSubBots = global.subbotlimitt || 20; 
    const subBots = global.conns.filter((c) => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
    const subBotsCount = subBots.length

    if (subBotsCount >= limiteSubBots) {
        return m.reply(`Se ha alcanzado o superado el límite de *Sub-Bots* activos (${subBotsCount}/${limiteSubBots}).`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathRubyJadiBot = path.join(`./${global.jadi}/`, id)
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
    RubyJBOptions.m = m
    RubyJBOptions.conn = conn
    RubyJBOptions.args = args
    RubyJBOptions.usedPrefix = usedPrefix
    RubyJBOptions.command = command
    RubyJBOptions.fromCommand = true
    RubyJadiBot(RubyJBOptions)
    global.db.data.users[m.sender].Subs = new Date() * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    
    let { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetryCache,
        browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino', 'Chrome','2.0.0'],
        version: version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions)
    let isInit = true

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update
        
        if (qr && !mcode) {
            let txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
            if (txtQR) setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key }).catch(e => {})}, 45000)
        }

        if (connection === 'open') {
            sock.isInit = true
            global.conns.push(sock)
            conn.reply(m.chat, `Conectado exitosamente como Sub-Bot.`, m)
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log(chalk.red(`Conexión de Sub-Bot cerrada. Razón: ${reason}`))
            if (reason !== DisconnectReason.loggedOut) {
                RubyJadiBot(options) // Tenta reconectar
            } else {
                fs.rmSync(pathRubyJadiBot, { recursive: true, force: true })
            }
        }
    }

    sock.ev.on('connection.update', connectionUpdate)
    sock.ev.on('creds.update', saveCreds)
    
    // Handler de mensagens para o Sub-Bot
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const handler = await import('../handler.js')
        handler.handler.call(sock, chatUpdate)
    })
}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60)
    return `${minutes} m y ${seconds} s`
}