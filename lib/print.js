import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

// Import dinâmico para evitar erros de inicialização
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
    if (m.key.remoteJid === 'status@broadcast') return
    
    // Captura o nome do usuário e do chat
    let _name = await conn.getName(m.sender)
    let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + chalk.green.bold(_name) : '')
    let chat = await conn.getName(m.chat)
    
    // Cálculo do tamanho da mensagem/arquivo
    let filesize = 0
    try {
        filesize = (m.msg ? (m.msg.vcard ? m.msg.vcard.length : m.msg.fileLength ? (m.msg.fileLength.low || m.msg.fileLength) : m.text ? m.text.length : 0) : m.text ? m.text.length : 0) || 0
    } catch (e) { filesize = 0 }

    let me = PhoneNumber('+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')).getNumber('international')
    
    let agora = new Date()
    let horaFormatada = agora.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    
    let chatName = chat ? (m.isGroup ? chalk.red.bold('Grupo: ') + chat : chalk.green.bold('Privado: ') + chat) : chalk.gray('Chat Desconhecido')
    let messageType = m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Sistema'
    
    if (m.messageStubType) messageType = 'Notif. Grupo'

    // LOG NO TERMINAL ESTILO RUBY
    console.log(chalk.magenta.dim('~'.repeat(20)) + chalk.cyan.bold(' G Ó T I C A  B O T ') + chalk.magenta.dim('~'.repeat(20)))
    console.log(`${chalk.cyan('╭')}${chalk.blue('─')}${chalk.white('⋯')}${chalk.blue('─[ ')+chalk.cyan.bold('INFO DO BOT')+chalk.blue(' ]')}${chalk.blue.dim('─'.repeat(38))}
${chalk.cyan('│')} 🤖 ${chalk.cyan.bold('Bot:')} ${chalk.white(me + ' ~ ' + (conn.user?.name || 'Gótica'))}
${chalk.cyan('│')} ⏰ ${chalk.white.bold('Hora:')} ${chalk.yellow(horaFormatada)}
${chalk.cyan('│')} 📑 ${chalk.white.bold('Tipo:')} ${chalk.green(messageType)}
${chalk.cyan('│')} ⚖️ ${chalk.white.bold('Peso:')} ${chalk.yellow(filesize === 0 ? '0 B' : (filesize / 1024).toFixed(1) + ' KB')}
${chalk.cyan('├')}${chalk.blue('─')}${chalk.white('⋯')}${chalk.blue('─[ ')+chalk.green.bold('USUÁRIO')+chalk.blue(' ]')}${chalk.blue.dim('─'.repeat(39))}
${chalk.cyan('│')} 👤 ${chalk.green.bold('De:')} ${chalk.white(sender)}
${chalk.cyan('│')} 📍 ${chalk.white.bold('Chat:')} ${chalk.white(chatName)}
${chalk.cyan('╰')}${chalk.blue.dim('─'.repeat(56))}`.trim())

    // Log do conteúdo da mensagem
    if (typeof m.text === 'string' && m.text) {
        let log = m.text.replace(/\u200e+/g, '')
        let prefix = m.error != null ? chalk.red.bold('❗️ ERRO: ') : m.isCommand ? chalk.yellow.bold('🔔 COMANDO: ') : chalk.white('💬 MENSAGEM: ')
        console.log(prefix + (m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log))
    }
    
    if (/audio/i.test(m.mtype)) {
        const duration = m.msg.seconds || 0
        console.log(`${m.msg.ptt ? chalk.red.bold('🎤 (Áudio Gravado) ') : chalk.green.bold('🎵 (Arquivo de Áudio) ')}${chalk.yellow(Math.floor(duration / 60).toString().padStart(2, 0))}${chalk.white(':')}${chalk.yellow((duration % 60).toString().padStart(2, 0))}`)
    }
    console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => { console.log(chalk.yellow("🔔 Atualização em 'lib/print.js'")) })