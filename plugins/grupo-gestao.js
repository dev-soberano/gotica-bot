/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Gestao de Grupo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos de gestao de grupo portados do Minato:
 *  !iddogrupo      - DDD do grupo
 *  !add_ddd        - adiciona DDD ao grupo
 *  !delete_ddd     - remove DDD do grupo
 *  !antiddd-list   - lista DDDs bloqueados
 *  !statusgp       - status do grupo
 *  !admins         - lista admins do grupo
 *  !recrutar       - adiciona membro (convite)
 *  !puxararquivo   - puxa arquivo para o grupo
 *  !sorteio        - sorteia usuarios
 *  !mudardesc      - muda descricao
 *  !fixname        - renomeia grupo
 *  !fixlink        - reseta link do grupo
 *  !substituir     - troca membro por outro
 */

import fs from 'fs'
import path from 'path'

const DDD_FILE = path.join(process.cwd(), 'src', 'dados', 'ddd.json')
const RECRUTAR_FILE = path.join(process.cwd(), 'src', 'dados', 'recrutados.json')

/** Le os DDDs configurados. */
function readDDD() {
    try {
        if (!fs.existsSync(DDD_FILE)) return { grupos: {}, bloqueados: [] }
        const p = JSON.parse(fs.readFileSync(DDD_FILE, 'utf-8'))
        return { grupos: p.grupos || {}, bloqueados: p.bloqueados || [] }
    } catch {
        return { grupos: {}, bloqueados: [] }
    }
}

/** Grava os DDDs. */
function writeDDD(data) {
    try {
        const dir = path.dirname(DDD_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(DDD_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Le os recrutados. */
function readRecrutados() {
    try {
        if (!fs.existsSync(RECRUTAR_FILE)) return []
        const p = JSON.parse(fs.readFileSync(RECRUTAR_FILE, 'utf-8'))
        return Array.isArray(p) ? p : []
    } catch {
        return []
    }
}

/** Grava os recrutados. */
function writeRecrutados(list) {
    try {
        const dir = path.dirname(RECRUTAR_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(RECRUTAR_FILE, JSON.stringify(list, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Extrai o DDD de um numero BR. */
function extractDDD(numero) {
    const n = String(numero || '').replace(/[^0-9]/g, '')
    if (n.length >= 11) return n.slice(-11, -9)
    if (n.length >= 10) return n.slice(-10, -8)
    return ''
}

/** Mapa de DDD para estado. */
const DDD_ESTADOS = {
    '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
    '21': 'RJ', '22': 'RJ', '24': 'RJ',
    '27': 'ES', '28': 'ES',
    '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG',
    '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR',
    '47': 'SC', '48': 'SC', '49': 'SC',
    '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS',
    '61': 'DF', '62': 'GO', '63': 'TO',
    '64': 'GO', '65': 'MT', '66': 'MT', '67': 'MS',
    '68': 'AC', '69': 'RO',
    '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
    '79': 'SE',
    '81': 'PE', '87': 'PE',
    '82': 'AL', '83': 'PB', '84': 'RN',
    '85': 'CE', '88': 'CE',
    '86': 'PI', '89': 'PI',
    '91': 'PA', '93': 'PA', '94': 'PA',
    '92': 'AM', '97': 'AM',
    '95': 'RR', '96': 'AP',
    '98': 'MA', '99': 'MA'
}

/** Extrai o estado a partir do DDD. */
function extractState(numero) {
    const ddd = extractDDD(numero)
    return DDD_ESTADOS[ddd] || '??'
}

const handler = async (m, { conn, args, command, text, isSoberano, isAdmin, isBotAdmin, groupMetadata, participants }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !iddogrupo ----------
    if (cmd === 'iddogrupo' || cmd === 'iddoddd') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const db = readDDD()
        const ddd = db.grupos[m.chat] || 'Nao definido'
        const bloqueado = db.bloqueados.includes(m.chat)

        let txt = `📱 *ID DO GRUPO*\n\n`
        txt += `🆔 *JID:* \`${m.chat}\`\n`
        txt += `📞 *DDD:* ${ddd}\n`
        txt += `🗺️ *Estado:* ${ddd !== 'Nao definido' ? extractState(ddd + '00000000') : '??'}\n`
        txt += `🚫 *Bloqueado:* ${bloqueado ? 'SIM' : 'NAO'}\n`
        txt += `👥 *Membros:* ${participants?.length || 0}`
        return m.reply(txt)
    }

    // ---------- !add_ddd ----------
    if (cmd === 'add_ddd' || cmd === 'addddd' || cmd === 'setddd') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const ddd = args[0]?.replace(/[^0-9]/g, '')
        if (!ddd || ddd.length !== 2) {
            return m.reply('📝 *Uso:*\n!add_ddd <DDD>\n\n*Exemplo:* `!add_ddd 47`\n\n💡 Só números de 2 dígitos.')
        }
        const db = readDDD()
        db.grupos[m.chat] = ddd
        writeDDD(db)
        return m.reply(`✅ *DDD definido!*\n\n📞 \`${ddd}\`\n🗺️ Estado: ${DDD_ESTADOS[ddd] || '??'}`)
    }

    // ---------- !delete_ddd / !del_ddd / !rm_ddd ----------
    if (cmd === 'delete_ddd' || cmd === 'del_ddd' || cmd === 'rm_ddd') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))
        const db = readDDD()
        const old = db.grupos[m.chat]
        if (!old) return m.reply('❌ Este grupo não tem DDD definido.')
        delete db.grupos[m.chat]
        writeDDD(db)
        return m.reply(`🗑️ *DDD removido!*\n\n📞 \`${old}\``)
    }

    // ---------- !antiddd-list ----------
    if (cmd === 'antiddd-list' || cmd === 'ddilist' || cmd === 'listaddi') {
        const db = readDDD()
        let txt = `🚫 *GRUPOS COM DDD BLOQUEADO*\n\n`
        if (!db.bloqueados.length) {
            txt += `_Nenhum grupo bloqueado._`
        } else {
            db.bloqueados.forEach((g, i) => {
                txt += `${i + 1}. \`${g}\` — DDD \`${db.grupos[g] || '?'}\`\n`
            })
        }
        return m.reply(txt)
    }

    // ---------- !statusgp / !statusgrupo ----------
    if (cmd === 'statusgp' || cmd === 'statusgrupo') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const meta = groupMetadata || {}
        const admins = (participants || []).filter(p => p.admin)

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  📊 *STATUS DO GRUPO*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `📛 *Nome:* ${meta.subject || 'Sem nome'}\n`
        txt += `👥 *Membros:* ${participants?.length || 0}\n`
        txt += `👑 *Admins:* ${admins.length}\n`
        txt += `📅 *Criado:* ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString('pt-BR') : 'N/D'}\n`
        txt += `📝 *Descricao:* ${meta.desc ? String(meta.desc).slice(0, 200) : 'Sem descricao'}\n`
        txt += `🔗 *Link:* ${meta.inviteCode ? `https://chat.whatsapp.com/${meta.inviteCode}` : 'Restrito'}`
        return m.reply(txt)
    }

    // ---------- !admins ----------
    if (cmd === 'admins' || cmd === 'listaadmins' || cmd === 'listadmins') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const admins = (participants || []).filter(p => p.admin)
        if (!admins.length) return m.reply('👑 *Nenhum admin encontrado.*')

        let txt = `👑 *ADMINS DO GRUPO*\n\n`
        admins.forEach((a, i) => {
            txt += `${i + 1}. @${(a.id || a.jid || '').split('@')[0]} ${a.admin === 'superadmin' ? '👑' : '⭐'}\n`
        })
        txt += `\n📊 *Total:* ${admins.length}`
        return m.reply(txt, null, { mentions: admins.map(a => a.id || a.jid).filter(Boolean) })
    }

    // ---------- !recrutar ----------
    if (cmd === 'recrutar' || cmd === 'regraspp' || cmd === 'papof') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const numero = args[0]?.replace(/[^0-9]/g, '')
        if (!numero) return m.reply('📝 *Uso:*\n!recrutar <numero>\n\n*Exemplo:* `!recrutar 554299441624`')

        const list = readRecrutados()
        if (!list.some(x => x.numero === numero)) {
            list.push({ numero, grupo: m.chat, data: Date.now(), recruitedBy: m.sender })
            writeRecrutados(list)
        }
        return m.reply(`📨 *Convite enviado!*\n\n📱 \`${numero}\`\n\n💡 A pessoa precisa ter o bot em contatos para ser recrutada.`)
    }

    // ---------- !puxararquivo ----------
    if (cmd === 'puxararquivo' || cmd === 'puxar-arquivo' || cmd === 'puxar') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const q = m.quoted
        if (!q) return m.reply('❌ *Responda a um arquivo para puxar para o grupo!*')
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))

        try {
            const buffer = await q.download(true)
            if (!buffer) return m.reply('❌ Erro ao baixar o arquivo.')
            const name = `arquivo-${Date.now()}.${(q.mimetype || 'bin').split('/')[1] || 'bin'}`
            await conn.sendMessage(m.chat, {
                document: buffer,
                fileName: name,
                mimetype: q.mimetype || 'application/octet-stream',
                caption: `📁 *Arquivo enviado por @${m.sender.split('@')[0]}*`
            }, { quoted: m })
        } catch (e) {
            console.error('[PUXAR-ARQUIVO]', e)
            m.reply('❌ Erro ao enviar o arquivo.')
        }
        return
    }

    // ---------- !sorteio ----------
    if (cmd === 'sorteio' || cmd === 'sorteionumero' || cmd === 'sorteionumeros') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const count = parseInt(args[0]) || 1
        const pool = (participants || []).filter(p => !p.admin && (p.id || p.jid) !== (conn.user?.jid || conn.user?.id))
        if (!pool.length) return m.reply('❌ *Nenhum membro disponível para o sorteio!*')

        const picked = []
        const copy = [...pool]
        for (let i = 0; i < Math.min(count, copy.length); i++) {
            picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
        }

        const ids = picked.map(p => p.id || p.jid).filter(Boolean)
        let txt = `🎲 *SORTEIO*\n\n`
        picked.forEach((p, i) => {
            txt += `${i + 1}. @${(p.id || p.jid || '').split('@')[0]}\n`
        })
        txt += `\n✨ *by Gótica Bot*`
        return m.reply(txt, null, { mentions: ids })
    }

    // ---------- !substituir ----------
    if (cmd === 'substituir' || cmd === 'substituicao') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        const [alvo, substituto] = args
        if (!alvo || !substituto) {
            return m.reply('📝 *Uso:*\n!substituir @mencionado @substituto\n\n*Exemplo:*\n`!substituir @user1 @user2`')
        }

        const alvoId = (alvo.match(/\d{5,}/) || [])[0]
        const subId = (substituto.match(/\d{5,}/) || [])[0]
        if (!alvoId || !subId) return m.reply('❌ Mencione os dois usuários.')

        try {
            await conn.groupParticipantsUpdate(m.chat, [`${alvoId}@s.whatsapp.net`], 'remove')
            await new Promise(r => setTimeout(r, 1200))
            await conn.groupParticipantsUpdate(m.chat, [`${subId}@s.whatsapp.net`], 'add')
            return m.reply(`🔄 *Substituição concluída!*\n\n❌ Removido: @${alvoId}\n✅ Adicionado: @${subId}`)
        } catch (e) {
            console.error('[SUBSTITUIR]', e)
            return m.reply('❌ Erro ao fazer a substituição.')
        }
    }

    // ---------- !mudardesc ----------
    if (cmd === 'mudardesc' || cmd === 'mudardescricao' || cmd === 'descgp' || cmd === 'descricao') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        if (!text) return m.reply('📝 *Uso:*\n!mudardesc <nova descrição>')
        try {
            await conn.groupUpdateDescription(m.chat, text)
            return m.reply('✅ *Descrição do grupo atualizada!*')
        } catch {
            return m.reply('❌ Erro ao atualizar a descrição.')
        }
    }

    // ---------- !fixname ----------
    if (cmd === 'fixname' || cmd === 'mudarnomegp' || cmd === 'nomegp' || cmd === 'mudarftgp' || cmd === 'colocarftgp') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        if (!text) return m.reply('📝 *Uso:*\n!fixname <novo nome>')
        try {
            await conn.groupUpdateSubject(m.chat, text)
            return m.reply('✅ *Nome do grupo atualizado!*')
        } catch {
            return m.reply('❌ Erro ao atualizar o nome.')
        }
    }

    // ---------- !fixlink ----------
    if (cmd === 'fixlink' || cmd === 'revlinkgp' || cmd === 'revlinkgroup' || cmd === 'redefinir') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isBotAdmin) return m.reply(global.dfail('botAdmin'))
        try {
            await conn.groupRevokeInvite(m.chat)
            const code = await conn.groupInviteCode(m.chat)
            return m.reply(`🔗 *Link do grupo resetado!*\n\nhttps://chat.whatsapp.com/${code}`)
        } catch {
            return m.reply('❌ Erro ao resetar o link.')
        }
    }
}

handler.help = ['iddogrupo', 'add_ddd', 'delete_ddd', 'statusgp', 'admins', 'recrutar', 'puxararquivo', 'sorteio']
handler.tags = ['group', 'admin']
handler.command = ['iddogrupo', 'iddoddd', 'add_ddd', 'addddd', 'setddd', 'delete_ddd', 'del_ddd', 'rm_ddd',
    'antiddd-list', 'ddilist', 'listaddi',
    'statusgp', 'statusgrupo', 'admins', 'listaadmins', 'listadmins', 'recrutar', 'regraspp', 'papof',
    'puxararquivo', 'puxar-arquivo', 'puxar', 'sorteio', 'sorteionumero', 'sorteionumeros',
    'substituir', 'substituicao', 'mudardesc', 'mudardescricao', 'descgp', 'descricao',
    'fixname', 'mudarnomegp', 'nomegp', 'mudarftgp', 'colocarftgp', 'fixlink', 'revlinkgp', 'revlinkgroup', 'redefinir']
handler.group = true

export default handler
