/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗       ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣       ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩       ╚═╝ ╚═╝  ╩
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot - Sistema NoPrefix por Grupo Definitivo
 *
 * CORRIGIDO: addnoprefix/noprefix on/off chamavam saveGroupData() e
 * respondiam "sucesso" sem checar se a gravação realmente deu certo —
 * se writeFileSync falhasse (permissão, disco, caminho), o comando
 * dizia "criado!" mesmo sem nada ter sido salvo, e o !listanoprefix
 * aparecia vazio logo depois sem nenhuma pista do motivo. Agora todo
 * saveGroupData() é checado e, se falhar, o comando avisa em vez de
 * fingir sucesso.
 */

import fs from 'fs'
import path from 'path'
import { getAllOwners } from '../lib/owners.js'
import {
    addCustomCmd, delCustomCmd, listCustomCmds
} from '../lib/helpers-minato.js'

/** Normaliza e garante que o JSON do grupo seja sempre um Objeto */
function getGroupFilePath(chatId) {
    const dir = path.join(process.cwd(), 'src', 'database', 'grupos')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const cleanId = String(chatId).replace(/[^a-zA-Z0-9-@._]/g, '')
    return { filePath: path.join(dir, `${cleanId}.json`), dir }
}

function getGroupData(chatId) {
    const { filePath } = getGroupFilePath(chatId)
    let data = {}
    try {
        if (fs.existsSync(filePath)) {
            const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            // Se o JSON antigo estiver no formato de Array [ {...} ], converte para Objeto para não quebrar
            if (Array.isArray(raw)) {
                data = raw[0] || {}
            } else if (typeof raw === 'object' && raw !== null) {
                data = raw
            }
        }
    } catch (e) {
        console.error('[GRUPO JSON] Erro ao ler:', e)
    }
    return { data, filePath }
}

function saveGroupData(filePath, data) {
    try {
        // Garante que sempre salva como Objeto padrão para unificar com o resto do bot
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (e) {
        console.error('[GRUPO JSON] Erro ao salvar:', e)
        return false
    }
}

const handler = async (m, { conn, args, command, text, isSoberano, isOwner, isAdmin }) => {
    const cmd = (command || '').toLowerCase()

    // 🛡️ Validação da Cúpula da Gótica
    const allOwners = getAllOwners().map(o => String(o).replace(/[^0-9]/g, ''))
    const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '')
    const isAnyOwner = isOwner || isSoberano || m?.fromMe || allOwners.includes(senderNum)

    // ================= COMANDOS DE DONO (CUSTOM CMDS) =================
    if (cmd === 'addcmddono' || cmd === 'addcmddonoofc' || cmd === 'addcmdofc' || cmd === 'addcmdvip') {
        if (!isAnyOwner) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply(`📝 *Uso:*\n!addcmddono <comando> <resposta>`)
        const nome = args[0].toLowerCase()
        const resposta = text.split(' ').slice(1).join(' ')
        if (!resposta) return m.reply('❌ Informe a resposta do comando.')

        const entry = addCustomCmd(nome, resposta, true)
        return m.reply(`✅ *Comando de dono criado!*\n\n🔧 \`!${entry.cmd}\`\n💬 ${entry.response}`)
    }

    if (cmd === 'delcmddono' || cmd === 'delcmddonoofc') {
        if (!isAnyOwner) return m.reply(global.dfail('owner'))
        if (!args[0]) return m.reply('📝 *Uso:*\n!delcmddono <comando>')
        const ok = delCustomCmd(args[0])
        if (!ok) return m.reply('❌ Comando não encontrado.')
        return m.reply(`🗑️ *Comando removido:* \`${args[0].toLowerCase()}\``)
    }

    if (cmd === 'listcmddono' || cmd === 'cmdofclist') {
        if (!isAnyOwner) return m.reply(global.dfail('owner'))
        const list = listCustomCmds().filter(c => c.owner)
        if (!list.length) return m.reply('📋 *Nenhum comando de dono cadastrado.*')
        let txt = `📋 *COMANDOS DE DONO*\n\n`
        list.forEach((c, i) => txt += `${i + 1}. \`!${c.cmd}\` → ${c.response}\n`)
        return m.reply(txt)
    }

    // ================= SISTEMA NO-PREFIX DO GRUPO =================

    // 1. !noprefix on / off
    if (cmd === 'noprefix') {
        if (!m.isGroup) return m.reply('✨ ❌ *Este comando só pode ser usado em grupos.*')
        if (!isAdmin && !isAnyOwner) return m.reply(global.dfail('admin'))

        const state = (args[0] || '').toLowerCase()
        const { data, filePath } = getGroupData(m.chat)

        if (state === 'on' || state === '1') {
            data.noprefix = true
            if (!saveGroupData(filePath, data)) {
                return m.reply('❌ Não consegui salvar a configuração deste grupo (erro ao gravar o arquivo). Veja o console do bot.')
            }
            return m.reply(`✅ *SISTEMA NO-PREFIX ATIVADO!*\n*Os comandos registrados funcionarão sem prefixo neste grupo.* 🍷`)
        } else if (state === 'off' || state === '0') {
            data.noprefix = false
            if (!saveGroupData(filePath, data)) {
                return m.reply('❌ Não consegui salvar a configuração deste grupo (erro ao gravar o arquivo). Veja o console do bot.')
            }
            return m.reply(`⚠️ *SISTEMA NO-PREFIX DESATIVADO!* 🍷`)
        } else {
            return m.reply(`📝 *Uso:* !noprefix on ou !noprefix off`)
        }
    }

    // 2. !addnoprefix m | menuadm
    if (cmd === 'addnoprefix' || cmd === 'add_prefixo') {
        if (!isAnyOwner) return m.reply(global.dfail('owner'))
        if (!m.isGroup) return m.reply('✨ ❌ *Este comando só pode ser usado em grupos.*')

        if (!text.includes('|')) {
            return m.reply(`📝 *Uso incorreto!*\n\n*Exemplo:*\n\`!addnoprefix m | menuadm\`\n_(Ao digitar apenas "m", executará "!menuadm")_`)
        }

        const [gatilhoRaw, alvoRaw] = text.split('|')
        const gatilho = gatilhoRaw.trim().toLowerCase()
        const alvo = alvoRaw.trim().toLowerCase().replace(/^!/, '')

        if (!gatilho || !alvo) return m.reply('❌ Informe o gatilho e o comando alvo separados por `|`.')

        const { data, filePath } = getGroupData(m.chat)
        if (!Array.isArray(data.noprefix_list)) data.noprefix_list = []

        const index = data.noprefix_list.findIndex(item => item.gatilho === gatilho)
        if (index !== -1) {
            data.noprefix_list[index].alvo = alvo
        } else {
            data.noprefix_list.push({ gatilho, alvo })
        }

        if (!saveGroupData(filePath, data)) {
            return m.reply(`❌ Não consegui salvar o atalho (erro ao gravar \`${filePath}\`). Veja o console do bot — provavelmente é permissão de escrita na pasta.`)
        }

        // Confere lendo de novo do disco — se não bater, avisa em vez de
        // fingir que deu certo (foi exatamente isso que sumiu antes).
        const { data: confere } = getGroupData(m.chat)
        const salvouCerto = Array.isArray(confere.noprefix_list) && confere.noprefix_list.some(item => item.gatilho === gatilho && item.alvo === alvo)
        if (!salvouCerto) {
            return m.reply(`⚠️ O arquivo foi gravado, mas ao reler o atalho \`${gatilho}\` não apareceu. Confira \`${filePath}\` manualmente.`)
        }

        return m.reply(`✅ *ATALHO NO-PREFIX CRIADO!*\n\n⌨️ *Digitar:* \`${gatilho}\`\n🚀 *Executará:* \`!${alvo}\``)
    }

    // 3. !listanoprefix
    if (cmd === 'listanoprefix' || cmd === 'listnoprefix' || cmd === 'noprefixlist') {
        if (!m.isGroup) return m.reply('✨ ❌ *Este comando só pode ser usado em grupos.*')

        const { data, filePath } = getGroupData(m.chat)
        const lista = data.noprefix_list || []

        if (!lista.length) {
            return m.reply(`📋 *Nenhum comando sem prefixo cadastrado neste grupo.*`)
        }

        let txt = `╭─〔 ⚡ *COMANDOS SEM PREFIXO* 〕\n│\n`
        lista.forEach((item, i) => {
            txt += `│ *${i + 1}.* \`${item.gatilho}\` ➔ \`!${item.alvo}\`\n`
        })
        txt += `╰─────────────────────\n> Para remover use: !rmnoprefix <número>`
        return m.reply(txt)
    }

    // 4. !rmnoprefix <número>
    if (cmd === 'rmnoprefix' || cmd === 'delnoprefix' || cmd === 'removerprefixo') {
        if (!isAnyOwner) return m.reply(global.dfail('owner'))
        if (!m.isGroup) return m.reply('✨ ❌ *Este comando só pode ser usado em grupos.*')

        const index = parseInt(args[0]) - 1
        const { data, filePath } = getGroupData(m.chat)
        const lista = data.noprefix_list || []

        if (isNaN(index) || index < 0 || index >= lista.length) {
            return m.reply(`❌ *Número inválido!* Use \`!listanoprefix\` para ver a lista com os números.`)
        }

        const removido = lista.splice(index, 1)[0]
        data.noprefix_list = lista

        if (!saveGroupData(filePath, data)) {
            return m.reply('❌ Não consegui salvar a remoção (erro ao gravar o arquivo). Veja o console do bot.')
        }

        return m.reply(`🗑️ *ATALHO REMOVIDO COM SUCESSO!*\n\n⌨️ \`${removido.gatilho}\` (que executava \`!${removido.alvo}\`) foi excluído.`)
    }
}

handler.help = ['noprefix', 'addnoprefix', 'listanoprefix', 'rmnoprefix']
handler.tags = ['owner', 'group']
handler.command = [
    'addcmddono', 'delcmddono', 'listcmddono',
    'noprefix', 'addnoprefix', 'add_prefixo',
    'listanoprefix', 'listnoprefix', 'noprefixlist',
    'rmnoprefix', 'delnoprefix', 'removerprefixo'
]

export default handler