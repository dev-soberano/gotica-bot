/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const { proto, generateWAMessage, areJidsSameUser } = (await import('@whiskeysockets/baileys')).default;

export async function all(m, chatUpdate) {
    if (m.isBaileys || !m.message) return
    
    // Verifica se é uma resposta de botão, lista ou mensagem interativa
    if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage || m.message.interactiveResponseMessage)) return

    let id
    try {
        if (m.message.buttonsResponseMessage) {
            id = m.message.buttonsResponseMessage.selectedButtonId
        } else if (m.message.templateButtonReplyMessage) {
            id = m.message.templateButtonReplyMessage.selectedId
        } else if (m.message.listResponseMessage) {
            id = m.message.listResponseMessage.singleSelectReply?.selectedRowId
        } else if (m.message.interactiveResponseMessage) {
            // Proteção contra JSON corrompido em mensagens interativas
            let paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson
            id = paramsJson ? JSON.parse(paramsJson).id : null
        }
    } catch (e) {
        console.error('Erro ao processar ID da mensagem interativa:', e)
        return
    }

    if (!id) return

    let text = m.message.buttonsResponseMessage?.selectedDisplayText || m.message.templateButtonReplyMessage?.selectedDisplayText || m.message.listResponseMessage?.title
    let isIdMessage = false
    let usedPrefix

    // Busca o comando nos plugins baseado no ID do botão
    for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (!plugin || plugin.disabled) continue

        // Se não for o Soberano, respeita a restrição de admin
        if (!opts['restrict']) {
            if (plugin.tags && plugin.tags.includes('admin') && !m.isAdmin) continue
        }

        if (typeof plugin !== 'function' || !plugin.command) continue

        const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
        
        const match = (_prefix instanceof RegExp ? [[_prefix.exec(id), _prefix]] : Array.isArray(_prefix) ? _prefix.map((p) => {
            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            return [re.exec(id), re]
        }) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]
        ).find((p) => p[1])

        if ((usedPrefix = (match[0] || '')[0])) {
            const noPrefix = id.replace(usedPrefix, '')
            let [command] = noPrefix.trim().split` `.filter((v) => v)
            command = (command || '').toLowerCase()
            const isId = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some((cmd) => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false
            if (!isId) continue
            isIdMessage = true
        }
    }

    // Gera a mensagem simulada para o bot processar o comando
    const messages = await generateWAMessage(m.chat, { text: isIdMessage ? id : text, mentions: m.mentionedJid }, {
        userJid: this.user.id,
        quoted: m.quoted && m.quoted.fakeObj,
    })

    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
    messages.key.id = m.key.id
    messages.pushName = m.name
    if (m.isGroup) messages.key.participant = messages.participant = m.sender

    const msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => (v.conn = this, v)),
        type: 'append',
    }

    this.ev.emit('messages.upsert', msg)
}