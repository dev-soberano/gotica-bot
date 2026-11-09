/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import path from 'path'

let cooldowns = {}
const marriagesFile = path.resolve('src/database/casados.json')

function loadMarriages() {
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {}
}

function formatTime(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60))
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60
    let result = []
    if (days) result.push(`${days}d`)
    if (hours) result.push(`${hours}h`)
    if (minutes || (!days && !hours)) result.push(`${minutes}m`)
    return result.join(' ')
}

function formatDate(timestamp) {
    const d = new Date(timestamp)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const handler = async (m, { conn, args }) => {
    const nomeUsuario = m.pushName || 'Explorador'
    const tempoEspera = 60 * 1000 // 1 Minuto
    const agora = Date.now()

    if (cooldowns[m.sender] && agora - cooldowns[m.sender] < tempoEspera) {
        let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - agora) / 1000)
        return m.reply(`*⚠️ SEM FLOOD!* Olá ${nomeUsuario}, aguarde ${restante}s para ver o ranking novamente.`)
    }

    let marriages = loadMarriages()
    let parejas = []
    const procesados = new Set()

    for (let user in marriages) {
        if (!procesados.has(user)) {
            const partner = marriages[user]?.partner || marriages[user]
            const date = marriages[user]?.date || marriages[partner]?.date
            if (partner && !procesados.has(partner) && date) {
                parejas.push({ user, partner, date })
                procesados.add(user)
                procesados.add(partner)
            }
        }
    }

    if (parejas.length === 0) return m.reply('*💔 Ainda não existem casais registrados no sistema.*')

    // Ordenar pelos casados há mais tempo
    parejas.sort((a, b) => a.date - b.date)

    cooldowns[m.sender] = agora
    const iconos = ['🥇', '🥈', '🥉']
    let page = args[0] && !isNaN(args[0]) ? parseInt(args[0]) : 1
    const perPage = 10
    const start = (page - 1) * perPage
    const end = start + perPage
    const totalPages = Math.ceil(parejas.length / perPage)

    if (page > totalPages) page = totalPages

    let texto = `*💍 RANKING DE CASAIS GÓTICA*\n_Os amores mais duradouros do grupo_\n\n`

    for (let i = start; i < Math.min(end, parejas.length); i++) {
        const p = parejas[i]
        const tempo = formatTime(Date.now() - p.date)
        const fecha = formatDate(p.date)
        const nombreUser = await conn.getName(p.user).catch(() => 'Usuário')
        const nombrePartner = await conn.getName(p.partner).catch(() => 'Usuário')
        const icono = iconos[i] || '✨'
        
        texto += `${icono} *${i + 1}.* ${nombreUser} & ${nombrePartner}\n`
        texto += `┇┆ ⏳ Tempo: *${tempo}*\n`
        texto += `┇┆ 📅 Desde: *${fecha}*\n\n`
    }

    texto += `*Página ${page} de ${totalPages}*`

    await conn.reply(m.chat, texto.trim(), m)
}

handler.help = ['topmarry']
handler.tags = ['fun']
handler.command = ['topparejas', 'topmarry', 'topcasados']
handler.group = true

export default handler