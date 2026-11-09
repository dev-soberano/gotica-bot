/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project ༄ Đev Šoberano ×͜×
 */

import fetch from 'node-fetch'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { setGp } from '../handler.js'

const fancyFontMap = {
  'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
  'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟴', '8': '𝟴', '9': '𝟵'
}

function toFancyText(text) {
  return text.split('').map(char => fancyFontMap[char] || char).join('')
}

function getGroupConfig(mChat) {
  const cleanFrom = mChat.split('@')[0] + '@g.us'
  const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
  let dataGp = [{}]
  if (existsSync(filePath)) {
    try {
      dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
      if (!Array.isArray(dataGp) || dataGp.length === 0) dataGp = [{}]
    } catch (e) {
      dataGp = [{}]
    }
  }
  return { dataGp, cleanFrom }
}

export async function before(m, { groupMetadata }) {
  if (!m.isGroup || m.fromMe) return true

  const { dataGp } = getGroupConfig(m.chat)
  const isModoAdmin = !!dataGp[0].modoadmin

  // Se o modo só adm não estiver ativo no JSON do grupo, permite o uso normal
  if (!isModoAdmin) return true

  // Verifica permissões de Adm e Soberano/Dono
  const senderNum = (m.sender || '').replace(/[^0-9]/g, '')
  const participants = groupMetadata?.participants || []
  const isAdmin = !!participants.find(u => {
    const uClean = (u.id || u.jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
    return (uClean === senderNum || u.id === m.sender) && (u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true)
  })

  const ownerList = Array.isArray(global.owner) ? global.owner : []
  const isOwner = ownerList.some(entry => {
    const ownerId = String(entry[0] || '').trim()
    const ownerDigits = ownerId.replace(/[^0-9]/g, '')
    return m.sender === ownerId || (ownerDigits && senderNum && ownerDigits === senderNum)
  })

  const isSoberano = isOwner || (m.sender && m.sender.includes('240041947357401'))
  if (isAdmin || isSoberano) return true

  // Verifica se a mensagem começa com o prefixo do bot
  const prefix = global.prefix || '!'
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const prefixRegex = new RegExp(`^(${escapedPrefix}|[°•π÷×¶∆£¢€¥$╦%=+|~!?@#%^&.©^])`)

  if (m.text && prefixRegex.test(m.text)) {
    // Apaga/cancela a execução do comando para membros comuns
    m.text = ''
    return false
  }

  return true
}

const handler = async (m, { conn, usedPrefix, command, args }) => {
  const { dataGp } = getGroupConfig(m.chat)

  if (args[0] === 'on' || args[0] === 'enable') {
    if (dataGp[0].modoadmin === true) return m.reply(`*Opa! O modo Soberano/Adm já está ativado aqui.*`)
    
    dataGp[0].modoadmin = true
    setGp(m.chat, dataGp)

    await m.react('🔐')
    let textOn = `✅ *MODO ADMIN ATIVADO*\n\nAgora só os patrões (Adms) podem me usar. Os membros comuns vão ter que esperar ou chorar na cama! 🤫🦇`
    await conn.reply(m.chat, textOn, m)
    
  } else if (args[0] === 'off' || args[0] === 'disable') {
    if (!dataGp[0].modoadmin) return m.reply(`*O modo já está desativado.*`)
    
    dataGp[0].modoadmin = false
    setGp(m.chat, dataGp)

    await m.react('🔓')
    let textOff = `⚠️ *MODO ADMIN DESATIVADO*\n\nPronto, liberei a bagunça. Agora até os meros mortais podem usar meus comandos de novo. 🙄`
    await conn.reply(m.chat, textOff, m)
    
  } else {
    const estado = dataGp[0].modoadmin ? '✓ Ativado (Só Adms)' : '✗ Desativado (Todos)'
    return conn.reply(m.chat, `「🦇」 ${toFancyText('Uso do Comando')}:\n*${usedPrefix}${command} on/off*\n\n${toFancyText('Estado Atual')}: *${toFancyText(estado)}*`, m)
  }
}

handler.help = ['soadm on/off']
handler.tags = ['adm']
handler.command = ['soadm', 'soloadmin', 'modoadmin']
handler.group = true
handler.admin = true

// O carregador do bot usa `module.default || module`, então o hook
// `before` de named export se perderia. Anexamos ao default export.
handler.before = before

export default handler