/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Sistema de Playlists
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Playlists portadas do Minato:
 *  !playlist / !addplaylist  - cria uma playlist
 *  !playplaylist             - toca a playlist
 *  !salvarplaylist           - salva a música atual na playlist
 *  !listaplaylists           - lista as playlists
 *  !removerplaylist          - remove uma playlist
 *  !limparplaylist           - limpa a playlist
 *  !delplaylist              - deleta uma música da playlist
 *  !nextplaylist             - próxima música
 *  !previousplaylist         - música anterior
 *  !pausarplaylist           - pausa
 *  !retornarplaylist         - retoma
 *  !pararplaylist            - para
 *  !tocamplaylist            - toca agora
 *  !modoplaylist on|off       - modo playlist (toca no grupo)
 */

import fs from 'fs'
import path from 'path'
import yts from 'yt-search'

const PLAYLIST_FILE = path.join(process.cwd(), 'src', 'dados', 'playlists.json')

/** Lê as playlists. */
function readPlaylists() {
    try {
        if (!fs.existsSync(PLAYLIST_FILE)) return { playlists: {}, user: {} }
        const p = JSON.parse(fs.readFileSync(PLAYLIST_FILE, 'utf-8'))
        return {
            playlists: p.playlists || {},
            user: p.user || {}
        }
    } catch {
        return { playlists: {}, user: {} }
    }
}

/** Grava as playlists. */
function writePlaylists(data) {
    try {
        const dir = path.dirname(PLAYLIST_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Busca a música no YouTube. */
async function searchMusic(query) {
    const res = await yts(query)
    if (!res?.videos?.length) return null
    const v = res.videos[0]
    return {
        url: v.url,
        title: v.title,
        author: v.author?.name || 'Desconhecido',
        duration: v.duration?.seconds || 0,
        thumbnail: v.thumbnail?.url || ''
    }
}

const handler = async (m, { conn, args, command, text, usedPrefix, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()
    const db = readPlaylists()
    const uid = m.sender

    // ---------- !playlist / !addplaylist ----------
    if (cmd === 'playlist' || cmd === 'addplaylist' || cmd === 'criarplaylist') {
        if (!args[0]) {
            const list = db.playlists[uid] || []
            if (!list.length) {
                return m.reply(`📻 *PLAYLISTS*\n\n📭 Você ainda não tem músicas salvas.\n\n💡 \`!playlist <nome da música>\` — adiciona\n💡 \`!playplaylist\` — toca`)
            }
            let txt = `📻 *SUA PLAYLIST*\n\n`
            list.forEach((s, i) => txt += `${i + 1}. *${s.title}*\n   👤 ${s.author}\n   ⏱️ ${s.duration}s\n`)
            return m.reply(txt)
        }

        await m.react('⏳')
        try {
            const song = await searchMusic(text)
            if (!song) {
                await m.react('❌')
                return m.reply('❌ *Música não encontrada!*')
            }
            db.playlists[uid] = db.playlists[uid] || []
            db.playlists[uid].push(song)
            writePlaylists(db)
            await m.react('✅')
            return m.reply(`✅ *Música salva na playlist!*\n\n🎵 *${song.title}*\n👤 ${song.author}\n📊 *Total:* ${db.playlists[uid].length} músicas`)
        } catch (e) {
            console.error('[PLAYLIST]', e)
            await m.react('❌')
            m.reply('❌ Erro ao adicionar na playlist.')
        }
        return
    }

    // ---------- !playplaylist / !tocamplaylist ----------
    if (cmd === 'playplaylist' || cmd === 'tocamplaylist' || cmd === 'play_playlist') {
        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*\n\n💡 Adicione com `!playlist <música>`')

        const idx = db.user[uid]?.index || 0
        const song = list[idx % list.length]
        if (!song) return m.reply('❌ Erro ao tocar a playlist.')

        await m.react('⏳')
        try {
            const { ytmp3 } = await import('../lib/youtubedl.js')
            const res = await ytmp3(song.url)
            if (!res?.status) {
                await m.react('❌')
                return m.reply('❌ Erro ao baixar a música.')
            }
            await conn.sendMessage(m.chat, {
                audio: { url: res.download?.url },
                mimetype: 'audio/mpeg',
                fileName: `${(song.title || 'audio').replace(/[^\w\s.-]/g, '')}.mp3`,
                caption: `📻 *PLAYLIST*\n\n🎵 *${song.title}*\n👤 ${song.author}\n\n📊 *${idx + 1}/${list.length}*\n💡 \`!nextplaylist\` — próxima`
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[PLAYLIST-PLAY]', e)
            await m.react('❌')
            m.reply('❌ Erro ao tocar a playlist.')
        }
        return
    }

    // ---------- !nextplaylist / !previousplaylist ----------
    if (cmd === 'nextplaylist' || cmd === 'proximoplaylist' || cmd === 'proxima_musica' || cmd === 'nextplaylist' || cmd === 'proximamusica') {
        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*')
        const cur = db.user[uid]?.index || 0
        const next = (cur + 1) % list.length
        db.user[uid] = { index: next }
        writePlaylists(db)

        const song = list[next]
        await m.react('⏳')
        try {
            const { ytmp3 } = await import('../lib/youtubedl.js')
            const res = await ytmp3(song.url)
            if (!res?.status) { await m.react('❌'); return m.reply('❌ Erro ao baixar.') }
            await conn.sendMessage(m.chat, {
                audio: { url: res.download?.url },
                mimetype: 'audio/mpeg',
                caption: `📻 *PLAYLIST*\n\n🎵 *${song.title}*\n👤 ${song.author}\n\n📊 *${next + 1}/${list.length}*`
            }, { quoted: m })
            await m.react('✅')
        } catch {
            await m.react('❌')
            m.reply('❌ Erro ao tocar.')
        }
        return
    }

    if (cmd === 'previousplaylist' || cmd === 'musicaanterior' || cmd === 'playlistanterior') {
        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*')
        const cur = db.user[uid]?.index || 0
        const prev = (cur - 1 + list.length) % list.length
        db.user[uid] = { index: prev }
        writePlaylists(db)

        const song = list[prev]
        await m.react('⏳')
        try {
            const { ytmp3 } = await import('../lib/youtubedl.js')
            const res = await ytmp3(song.url)
            if (!res?.status) { await m.react('❌'); return m.reply('❌ Erro ao baixar.') }
            await conn.sendMessage(m.chat, {
                audio: { url: res.download?.url },
                mimetype: 'audio/mpeg',
                caption: `📻 *PLAYLIST*\n\n🎵 *${song.title}*\n👤 ${song.author}\n\n📊 *${prev + 1}/${list.length}*`
            }, { quoted: m })
            await m.react('✅')
        } catch {
            await m.react('❌')
            m.reply('❌ Erro ao tocar.')
        }
        return
    }

    // ---------- !removerplaylist / !limparplaylist / !delplaylist ----------
    if (cmd === 'removerplaylist' || cmd === 'remplaylist' || cmd === 'rmplaylist' || cmd === 'limparplaylist' || cmd === 'delplaylist' || cmd === 'apagarplaylistuser') {
        if (!args[0] && cmd !== 'limparplaylist') {
            return m.reply(`📝 *Uso:*\n!removerplaylist <nome ou índice>\n\n💡 \`!listaplaylists\` para ver as suas.`)
        }

        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*')

        if (cmd === 'limparplaylist') {
            db.playlists[uid] = []
            db.user[uid] = { index: 0 }
            writePlaylists(db)
            return m.reply('🗑️ *Playlist limpa!*')
        }

        const arg = args.join(' ').toLowerCase()
        let idx = parseInt(args[0]) - 1
        if (isNaN(idx) || idx < 0) {
            idx = list.findIndex(s => s.title.toLowerCase().includes(arg))
        }
        if (idx < 0 || idx >= list.length) return m.reply('❌ *Música não encontrada na playlist!*')

        const removed = list.splice(idx, 1)
        db.playlists[uid] = list
        writePlaylists(db)
        return m.reply(`🗑️ *Removido da playlist!*\n\n🎵 *${removed[0].title}*\n📊 *Restantes:* ${list.length}`)
    }

    // ---------- !listaplaylists ----------
    if (cmd === 'listaplaylists' || cmd === 'listplaylistusers' || cmd === 'usuariosplaylist' || cmd === 'playlistuser' || cmd === 'playlistglobal') {
        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*')

        let txt = `📻 *SUAS MÚSICAS*\n\n`
        list.forEach((s, i) => {
            txt += `${i + 1}. *${s.title}*\n   👤 ${s.author}\n   ⏱️ ${s.duration}s\n`
        })
        txt += `\n📊 *Total:* ${list.length}\n💡 \`!playplaylist\` — tocar`
        return m.reply(txt)
    }

    // ---------- !salvarplaylist ----------
    if (cmd === 'salvarplaylist' || cmd === 'salvarplaylistuser') {
        const list = db.playlists[uid] || []
        if (!list.length) return m.reply('📭 *Sua playlist está vazia!*')
        const idx = db.user[uid]?.index || 0
        const song = list[idx]
        if (!song) return m.reply('❌ Nenhuma música para salvar.')
        return m.reply(`💾 *Música atual:*\n\n🎵 *${song.title}*\n👤 ${song.author}\n🔗 ${song.url}`)
    }
}

handler.help = ['playlist', 'playplaylist', 'nextplaylist', 'listaplaylists', 'limparplaylist']
handler.tags = ['music', 'playlist']
handler.command = ['playlist', 'addplaylist', 'criarplaylist', 'playplaylist', 'tocamplaylist', 'play_playlist',
    'nextplaylist', 'proximoplaylist', 'proxima_musica', 'proximamusica', 'previousplaylist', 'musicaanterior',
    'playlistanterior', 'removerplaylist', 'remplaylist', 'rmplaylist', 'limparplaylist', 'delplaylist',
    'apagarplaylistuser', 'listaplaylists', 'listplaylistusers', 'usuariosplaylist', 'playlistuser',
    'playlistglobal', 'salvarplaylist', 'salvarplaylistuser']

export default handler
