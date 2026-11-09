/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 *
 * @project Gótica Bot - Gestão Extra de Grupos
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos de gestão de grupo portados do Minato:
 *   !entrar [link]      - o bot entra em um grupo pelo link
 *   !sairgp             - o bot sai do grupo atual
 *   !sair_all           - o bot sai de todos os grupos
 *   !totag              - marca todos com um texto
 *   !marcar2            - marca todos (variante)
 *   !advertir @user     - adverte um membro (3 avisos = expulsão)
 *   !rmadv @user        - remove o aviso de um membro
 *   !listanegra @user   - bloqueia um número no grupo
 *   !rmadv              - (ver acima)
 *   !autobang @user     - bloqueio global (lista negra do bot)
 *   !unbangp @user      - remove o bloqueio global
 *   !blocklist          - lista os bloqueados globais
 *   !blockuser @user    - bloqueia um número globalmente
 *   !unblockuser @user  - desbloqueia um número globalmente
 *   !so_adm             - restringe o grupo só para admins
 *   !so_dono            - restringe o grupo só para o dono
 *   !atividade          - membros ativos no grupo
 *   !checkativo @user   - verifica se um membro está ativo
 *   !inativos           - lista membros inativos
 *   !listban            - lista os banidos do grupo
 *   !listafake          - lista os fakes do grupo
 *   !desmute @user      - remove o mute de um membro
 *   !ativic             - ativa o modo de menu interativo
 *   !rmphotogp          - remove a foto do grupo
 *   !limitec <n>        - limite de caracteres por mensagem
 *   !limitecaracteres   - mostra o limite atual
 *   !tempocmd <seg>     - tempo de expiração dos comandos
 *   !limitarcmd         - limita o uso de comandos
 *   !zerarcontadorgrupo - zera os contadores do grupo
 *   !zeraranycount      - zera qualquer contador
 *   !clearperm          - limpa as permissões do grupo
 *   !limpardb           - limpa o banco de um grupo
 *   !limpargp           - limpa os dados do grupo
 *   !limparcontador     - zera os contadores
 *   !limitec_global     - limite global de caracteres
 */

import { lerGrupo, gravarGrupo, lerDado, gravarDado, somenteDigitos, paraJid, formatarNumero } from '../lib/grupo.js'

const ARQUIVO_TM = 'transmissao.json'
const ARQUIVO_LISTANEGRA = 'listanegra-global.json'
const ARQUIVO_PERMISSOES = 'permissoes-global.json'

/** Extrai o JID de quem foi marcado na mensagem. */
function alvoMarcado(m) {
    const ctx = m?.msg?.contextInfo || m?.message?.extendedTextMessage?.contextInfo
    const lista = ctx?.mentionedJid || []
    return lista[0] || null
}

/** Devolve o número do membro marcado, sem o @s.whatsapp.net. */
function numeroDoAlvo(m) {
    const jid = alvoMarcado(m)
    if (!jid) return null
    const n = somenteDigitos(jid)
    return n || null
}

/** Pega os participantes do grupo, filtrando o bot. */
function participantes(conn, m) {
    const meta = global.groupCache?.[m.chat]?.metadata
    const lista = meta?.participants || []
    return lista
        .map(p => p.id || p.jid || p.phoneNumber)
        .filter(Boolean)
        .filter(j => j !== conn.user?.id && !String(j).endsWith(':1@lid'))
}

const handler = async (m, { conn, command, args, text, isSoberano, isAdmin, isBotAdmin }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ ENTRAR / SAIR ══════════════
    if (cmd === 'entrar' || cmd === 'entrargp') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const link = (text || '').replace(/^https?:\/\/chat\.whatsapp\.com\//, '').trim()
        if (!link) {
            return m.reply('🖤 *Gótica — Entrar no grupo*\n\n📎 Envie o link do grupo:\n`!entrar https://chat.whatsapp.com/XXXX`')
        }
        try {
            const [, codigo] = link.match(/(?:chat\.whatsapp\.com\/)?([\w-]+)/) || []
            if (!codigo) return m.reply('❌ *Link inválido.* Use o formato `chat.whatsapp.com/XXXX`.')
            const invite = codigo.replace(/[^A-Za-z0-9]/g, '')
            const id = await conn.groupAcceptInvite(invite)
            return m.reply(`✅ *Entrei no grupo!* 🖤\n\n🆔 \`${id}\`\n✦ Agora sou parte da cripta.`)
        } catch (e) {
            return m.reply(`❌ *Não consegui entrar.*\n\nℹ️ O link pode ter expirado ou o grupo já está cheio.\n📎 Detalhe: ${String(e.message).slice(0, 120)}`)
        }
    }

    if (cmd === 'sairgp') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        if (!m.isGroup) return m.reply(global.dfail('group'))
        try {
            await conn.groupLeave(m.chat)
            return m.reply('🖤 *Saí do grupo.* Até a próxima cripta.')
        } catch (e) {
            return m.reply('❌ *Não consegui sair do grupo.*')
        }
    }

    if (cmd === 'sair_all') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        try {
            const todos = await conn.groupFetchAllParticipating()
            const grupos = Object.values(todos).filter(g => String(g.id).endsWith('@g.us'))
            if (!grupos.length) return m.reply('🖤 *Nenhum grupo para abandonar.*')
            let ok = 0
            for (const g of grupos) {
                try {
                    await conn.groupLeave(g.id)
                    ok++
                } catch (e) { continue }
            }
            return m.reply(`🖤 *Abandonei ${ok} de ${grupos.length} grupos.*\n\n✦ Nenhuma cripta me prendia.`)
        } catch (e) {
            return m.reply('❌ *Falha ao listar os grupos.*')
        }
    }

    // ══════════════ MARCAÇÃO EM MASSA ══════════════
    if (cmd === 'totag' || cmd === 'hidetag' || cmd === 'citar' || cmd === 'cita') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        if (!isBotAdmin && !isSoberano) return m.reply(global.dfail('botAdmin'))

        const membros = participantes(conn, m)
        if (!membros.length) return m.reply('❌ *Não encontrei membros neste grupo.*')

        const texto = (text || '').trim() || '☾ 𝙂𝙤̃𝙩𝙤̃𝙩𝙖𝙖𝙤 ༻⋆☽'
        const mencoes = membros.map(j => `@${String(j).split('@')[0]}`).join('\n')

        return conn.sendMessage(m.chat, {
            text: `${texto}\n\n${mencoes}`,
            mentions: membros,
            contextInfo: { mentionedJid: membros }
        })
    }

    if (cmd === 'marcar' || cmd === 'marcar2') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        if (!isBotAdmin && !isSoberano) return m.reply(global.dfail('botAdmin'))

        const membros = participantes(conn, m)
        if (!membros.length) return m.reply('❌ *Não encontrei membros neste grupo.*')

        const texto = (text || '').trim() || '☾ 𝙂𝙤̃𝙩𝙤̃𝙩𝙖𝙖𝙤 ༻⋆☽'
        const mencoes = membros.map(j => `@${String(j).split('@')[0]}`).join('\n')

        return conn.sendMessage(m.chat, {
            text: `${texto}\n\n${mencoes}`,
            mentions: membros,
            contextInfo: { mentionedJid: membros }
        })
    }

    // ══════════════ ADVERTÊNCIAS ══════════════
    if (cmd === 'advertir' || cmd === 'adverter') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!advertir`.')

        const config = lerGrupo(m.chat)
        const avisos = Array.isArray(config.advertir) ? config.advertir : []
        const jid = paraJid(numero)

        if (!avisos.some(a => a.id === jid)) avisos.push({ id: jid, msg: 'Sem motivo especificado', hora: Date.now() })
        config.advertir = avisos
        gravarGrupo(m.chat, config)

        const total = avisos.filter(a => a.id === jid).length

        if (total >= 3) {
            await conn.sendMessage(m.chat, {
                text: `🚫 *Terceira advertência, ${formatarNumero(numero)}.*\n\nA cripta não aceita desrespeito. Expulsando.`,
                contextInfo: { mentionedJid: [jid] }
            })
            try {
                await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
            } catch (e) { }
            config.advertir = avisos.filter(a => a.id !== jid)
            gravarGrupo(m.chat, config)
            return
        }

        return m.reply(`⚠️ *Advertência aplicada.*\n\n👤 ${formatarNumero(numero)}\n🔔 Aviso ${total}/3\n\n_Um terceiro aviso resulta em expulsão._`)
    }

    if (cmd === 'rmadv') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!rmadv`.')

        const config = lerGrupo(m.chat)
        const avisos = Array.isArray(config.advertir) ? config.advertir : []
        const jid = paraJid(numero)
        const antes = avisos.length
        config.advertir = avisos.filter(a => a.id !== jid)
        gravarGrupo(m.chat, config)

        if (antes === config.advertir.length) return m.reply('❌ *Este membro não tem advertências registradas.*')
        return m.reply(`🧹 *Advertência removida.*\n\n👤 ${formatarNumero(numero)}\n✦ O assunto foi encerrado.`)
    }

    // ══════════════ LISTA NEGRA ══════════════
    if (cmd === 'listanegra' || cmd === 'addautorm' || cmd === 'addautoban') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!listanegra`.')

        const config = lerGrupo(m.chat)
        const negra = Array.isArray(config.listanegra) ? config.listanegra : []
        const jid = paraJid(numero)

        if (negra.includes(jid)) return m.reply('⚠️ *Este número já está na lista negra deste grupo.*')

        negra.push(jid)
        config.listanegra = negra
        gravarGrupo(m.chat, config)

        return m.reply(`🚫 *Número bloqueado no grupo.*\n\n👤 ${formatarNumero(numero)}\n✦ Não entra mais.`)
    }

    if (cmd === 'autobang' || cmd === 'listanegrag') {
        if (!isSoberano) return m.reply(global.dfail('owner'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!autobang`.')

        const global1 = lerDado(ARQUIVO_LISTANEGRA, [])
        const jid = paraJid(numero)
        if (global1.includes(jid)) return m.reply('⚠️ *Este número já está na lista negra global.*')

        global1.push(jid)
        gravarDado(ARQUIVO_LISTANEGRA, global1)

        return m.reply(`🚫 *Bloqueio global aplicado.*\n\n👤 ${formatarNumero(numero)}\n✦ Não entra em nenhum lugar.`)
    }

    if (cmd === 'unbangp' || cmd === 'rmadvglobal') {
        if (!isSoberano) return m.reply(global.dfail('owner'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!unbangp`.')

        const global1 = lerDado(ARQUIVO_LISTANEGRA, [])
        const jid = paraJid(numero)
        const novo = global1.filter(j => j !== jid)
        if (novo.length === global1.length) return m.reply('❌ *Este número não estava bloqueado globalmente.*')

        gravarDado(ARQUIVO_LISTANEGRA, novo)
        return m.reply(`🔓 *Bloqueio global removido.*\n\n👤 ${formatarNumero(numero)}`)
    }

    if (cmd === 'blocklist') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const global1 = lerDado(ARQUIVO_LISTANEGRA, [])
        if (!global1.length) return m.reply('📋 *Nenhum bloqueio global registrado.*')

        let txt = `🚫 *BLOQUEIOS GLOBAIS*\n\n`
        global1.forEach((j, i) => { txt += `${i + 1}. ${formatarNumero(j)}\n` })
        return m.reply(txt)
    }

    if (cmd === 'blockuser' || cmd === 'unblockuser') {
        if (!isSoberano) return m.reply(global.dfail('owner'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie o comando.')

        const bloqueados = lerDado('usuarios-bloqueados.json', [])
        const jid = paraJid(numero)

        if (cmd === 'blockuser') {
            if (bloqueados.includes(jid)) return m.reply('⚠️ *Este usuário já está bloqueado.*')
            bloqueados.push(jid)
            gravarDado('usuarios-bloqueados.json', bloqueados)
            return m.reply(`🚫 *Usuário bloqueado.*\n\n👤 ${formatarNumero(numero)}`)
        }

        const novo = bloqueados.filter(j => j !== jid)
        if (novo.length === bloqueados.length) return m.reply('❌ *Este usuário não estava bloqueado.*')
        gravarDado('usuarios-bloqueados.json', novo)
        return m.reply(`🔓 *Usuário desbloqueado.*\n\n👤 ${formatarNumero(numero)}`)
    }

    // ══════════════ MODOS DE ACESSO ══════════════
    if (cmd === 'so_adm' || cmd === 'soadm') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const config = lerGrupo(m.chat)
        const estado = !config.soAdm
        config.soAdm = estado
        gravarGrupo(m.chat, config)

        return m.reply(estado
            ? `🔒 *Somente admins.*\n\n✦ A partir de agora só os administradores podem falar aqui.`
            : `🔓 *Todos podem falar.*\n\n✦ O grupo voltou a ser livre.`)
    }

    if (cmd === 'so_dono' || cmd === 'sodono') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const config = lerGrupo(m.chat)
        const estado = !config.soDono
        config.soDono = estado
        gravarGrupo(m.chat, config)

        return m.reply(estado
            ? `👑 *Somente o dono.*\n\n✦ A cripta se fechou para os mortais.`
            : `🔓 *O grupo voltou a ser livre.*`)
    }

    // ══════════════ ATIVIDADE ══════════════
    if (cmd === 'atividade' || cmd === 'checkativo' || cmd === 'inativos' || cmd === 'check') {
        if (!m.isGroup) return m.reply(global.dfail('group'))

        const config = lerGrupo(m.chat)
        const atividades = config.atividades || {}

        if (cmd === 'checkativo') {
            const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
            if (!numero) return m.reply('📝 *Uso:* `!checkativo <número>`')
            const reg = atividades[paraJid(numero)]
            if (!reg) return m.reply(`💤 *${formatarNumero(numero)}* ainda não registrou atividade.\n\n✦ Nenhuma mensagem contada.`)
            return m.reply(`📊 *ATIVIDADE*\n\n👤 ${formatarNumero(numero)}\n💬 Mensagens: ${reg.msgs || 0}\n🕐 Última: ${reg.ultimo || '—'}`)
        }

        if (cmd === 'inativos') {
            const inativos = Object.entries(atividades)
                .filter(([, v]) => Date.now() - (v.ultimo || 0) > 7 * 86400000)
                .sort((a, b) => (a[1].ultimo || 0) - (b[1].ultimo || 0))
            if (!inativos.length) return m.reply('💤 *Ninguém está inativo há mais de 7 dias.*')
            let txt = `💤 *MEMBROS INATIVOS*\n\n`
            inativos.slice(0, 30).forEach(([jid, v], i) => {
                txt += `${i + 1}. ${formatarNumero(jid)} — ${v.msgs || 0} msgs\n`
            })
            return m.reply(txt)
        }

        const ranking = Object.entries(atividades)
            .sort((a, b) => (b[1].msgs || 0) - (a[1].msgs || 0))
            .slice(0, 20)
        if (!ranking.length) return m.reply('📊 *Nenhuma atividade registrada neste grupo ainda.*')

        let txt = `📊 *ATIVIDADE DO GRUPO*\n\n`
        ranking.forEach(([jid, v], i) => {
            txt += `${i + 1}. ${formatarNumero(jid)} — 💬 ${v.msgs || 0}\n`
        })
        return m.reply(txt)
    }

    // ══════════════ LISTAS ══════════════
    if (cmd === 'listban') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const config = lerGrupo(m.chat)
        const banidos = Array.isArray(config.banidos) ? config.banidos : []
        if (!banidos.length) return m.reply('📋 *Nenhum banido registrado neste grupo.*')

        let txt = `🚫 *BANIDOS DO GRUPO*\n\n`
        banidos.slice(0, 40).forEach((b, i) => {
            txt += `${i + 1}. ${formatarNumero(typeof b === 'string' ? b : b.id)}\n`
        })
        return m.reply(txt)
    }

    if (cmd === 'listafake' || cmd === 'listafakes') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const config = lerGrupo(m.chat)
        const fakes = Array.isArray(config.fakes) ? config.fakes : []
        if (!fakes.length) return m.reply('📋 *Nenhum fake registrado neste grupo.*')

        let txt = `🧟 *FAKES DO GRUPO*\n\n`
        fakes.slice(0, 40).forEach((f, i) => {
            txt += `${i + 1}. ${formatarNumero(typeof f === 'string' ? f : f.id)}\n`
        })
        return m.reply(txt)
    }

    if (cmd === 'desmute') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const numero = numeroDoAlvo(m) || somenteDigitos(args[0])
        if (!numero) return m.reply('📝 *Uso:* marque a pessoa e envie `!desmute`.')

        const config = lerGrupo(m.chat)
        const mudados = Array.isArray(config.mutes) ? config.mutes : []
        const jid = paraJid(numero)
        const novo = mudados.filter(x => x !== jid)
        if (novo.length === mudados.length) return m.reply('❌ *Este membro não estava mudo.*')

        config.mutes = novo
        gravarGrupo(m.chat, config)
        return m.reply(`🔊 *Mute removido.*\n\n👤 ${formatarNumero(numero)}\n✦ A voz voltou à cripta.`)
    }

    if (cmd === 'ativic') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))

        const config = lerGrupo(m.chat)
        config.menuInterativo = true
        gravarGrupo(m.chat, config)
        return m.reply('🖤 *Menu interativo ativado neste grupo.*\n\n✦ Os botões voltaram a respirar.')
    }

    if (cmd === 'rmphotogp' || cmd === 'rmfotogroup') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        try {
            await conn.groupUpdatePicture(m.chat, '')
            return m.reply('🖼️ *Foto do grupo removida.*')
        } catch (e) {
            return m.reply('❌ *Não consegui remover a foto do grupo.*')
        }
    }

    // ══════════════ LIMITES E CONTADORES ══════════════
    if (cmd === 'limitec' || cmd === 'limitec_global') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const n = Number(somenteDigitos(args[0]))

        if (cmd === 'limitec_global') {
            const atual = lerDado('limite-global.json', { limite: 0 })
            if (!n) {
                return m.reply(`📏 *Limite global de caracteres:* ${atual.limite || 'sem limite'}\n\n✦ Uso: \`!limitec_global <número>\``)
            }
            gravarDado('limite-global.json', { limite: n })
            return m.reply(`📏 *Limite global definido:* ${n} caracteres.`)
        }

        if (!m.isGroup) return m.reply(global.dfail('group'))
        const config = lerGrupo(m.chat)
        if (!n) {
            return m.reply(`📏 *Limite deste grupo:* ${config.limiteCaracteres || 'sem limite'}\n\n✦ Uso: \`!limitec <número>\``)
        }
        config.limiteCaracteres = n
        gravarGrupo(m.chat, config)
        return m.reply(`📏 *Limite definido:* ${n} caracteres por mensagem.`)
    }

    if (cmd === 'limitecaracteres') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const config = lerGrupo(m.chat)
        return m.reply(`📏 *Limite de caracteres neste grupo:* ${config.limiteCaracteres || 'sem limite'}`)
    }

    if (cmd === 'tempocmd' || cmd === 'limitarcmd' || cmd === 'limitecmd') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const seg = Number(somenteDigitos(args[0]))
        const atual = lerDado('tempocmd.json', { segundos: 0 })

        if (!seg) {
            return m.reply(`⏱️ *Tempo atual dos comandos:* ${atual.segundos || 0}s\n\n✦ Uso: \`!tempocmd <segundos>\``)
        }
        gravarDado('tempocmd.json', { segundos: seg })
        return m.reply(`⏱️ *Comandos expiram em ${seg}s.*\n\n✦ Ninguém abusa da cripta.`)
    }

    if (cmd === 'zerarcontadorgrupo' || cmd === 'zerarcontador' || cmd === 'resetcontadorgrupo') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        const config = lerGrupo(m.chat)
        config.contadores = {}
        gravarGrupo(m.chat, config)
        return m.reply('🧮 *Contadores do grupo zerados.*')
    }

    if (cmd === 'zeraranycount' || cmd === 'resetanycount' || cmd === 'limparanycount' || cmd === 'limparcontador' || cmd === 'limparcnt') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        const config = lerGrupo(m.chat)
        config.contadores = {}
        config.anyCount = {}
        gravarGrupo(m.chat, config)
        return m.reply('🧮 *Contadores zerados.*\n\n✦ A contagem recomeça.')
    }

    if (cmd === 'clearperm') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        const config = lerGrupo(m.chat)
        config.permissoes = {}
        config.admins = []
        gravarGrupo(m.chat, config)
        return m.reply('🧹 *Permissões do grupo limpas.*\n\n✦ Todo mundo volta a ser mortal.')
    }

    if (cmd === 'limpardb' || cmd === 'tirardb') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const config = lerGrupo(m.chat)
        for (const chave of Object.keys(config)) {
            if (chave === 'bemvindo' || chave === 'exit' || chave === 'real') continue
            delete config[chave]
        }
        gravarGrupo(m.chat, config)
        return m.reply('🧹 *Banco do grupo limpo.*\n\n✦ Tudo apagado, exceto as boas-vindas.')
    }

    if (cmd === 'limpargp' || cmd === 'cleargp') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        if (!isAdmin && !isSoberano) return m.reply(global.dfail('admin'))
        const config = lerGrupo(m.chat)
        const preserva = {
            bemvindo: config.bemvindo,
            exit: config.exit,
            real: config.real
        }
        gravarGrupo(m.chat, preserva)
        return m.reply('🧹 *Dados do grupo limpos.*\n\n✦ A cripta foi silenciada.')
    }

    // ══════════════ TRANSMISSÃO (dono) ══════════════
    if (cmd === 'rgtm' || cmd === 'tirardatm' || cmd === 'listatm') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const lista = lerDado(ARQUIVO_TM, [])

        if (cmd === 'rgtm') {
            if (!m.isGroup) return m.reply(global.dfail('group'))
            if (lista.some(g => g.id === m.chat)) return m.reply('⚠️ *Este grupo já está na lista de transmissão.*')
            lista.push({ id: m.chat, nome: m.pushName || 'sem nome' })
            gravarDado(ARQUIVO_TM, lista)
            return m.reply('📡 *Grupo adicionado à transmissão.*\n\n✦ As mensagens chegarão a todos.')
        }

        if (cmd === 'tirardatm') {
            if (!lista.length) return m.reply('📡 *Nenhum grupo na lista de transmissão.*')
            const alvo = (text || '').trim() || m.chat
            const novo = lista.filter(g => g.id !== alvo && !String(g.id).includes(alvo))
            if (novo.length === lista.length) return m.reply('❌ *Não encontrei esse grupo na lista.*')
            gravarDado(ARQUIVO_TM, novo)
            return m.reply('📡 *Grupo removido da transmissão.*')
        }

        if (!lista.length) return m.reply('📡 *Nenhum grupo na lista de transmissão.*')
        let txt = `📡 *GRUPOS DA TRANSMISSÃO*\n\n`
        lista.forEach((g, i) => { txt += `${i + 1}. ${g.nome || g.id}\n   \`${g.id}\`\n` })
        return m.reply(txt)
    }
}

handler.help = [
    'entrar <link>', 'sairgp', 'sair_all', 'totag', 'advertir', 'rmadv',
    'listanegra', 'autobang', 'unbangp', 'blocklist', 'blockuser',
    'unblockuser', 'so_adm', 'so_dono', 'atividade', 'inativos',
    'listban', 'listafake', 'desmute', 'limitec <n>', 'tempocmd <s>',
    'zerarcontadorgrupo', 'clearperm',
    'limpardb', 'limpargp', 'rgtm', 'tirardatm', 'listatm'
]
handler.tags = ['grupo']
handler.command = [
    'entrar', 'entrargp', 'sairgp', 'sair_all',
    'totag', 'hidetag', 'citar', 'cita', 'marcar', 'marcar2',
    'advertir', 'adverter', 'rmadv',
    'listanegra', 'addautorm', 'addautoban', 'autobang', 'listanegrag',
    'unbangp', 'blocklist', 'blockuser', 'unblockuser',
    'so_adm', 'soadm', 'so_dono', 'sodono',
    'atividade', 'checkativo', 'inativos', 'check',
    'listban', 'listafake', 'listafakes', 'desmute', 'ativic',
    'rmphotogp', 'rmfotogroup',
    'limitec', 'limitec_global', 'limitecaracteres',
    'tempocmd', 'limitarcmd', 'limitecmd',
    'zerarcontadorgrupo', 'zerarcontador', 'resetcontadorgrupo',
    'zeraranycount', 'resetanycount', 'limparanycount',
    'limparcontador', 'limparcnt', 'clearperm',
    'limpardb', 'tirardb', 'limpargp', 'cleargp',
    'rgtm', 'tirardatm', 'listatm'
]
handler.group = true

export default handler
