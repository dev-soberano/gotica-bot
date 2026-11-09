/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Efeitos de Vídeo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Efeitos extras portados do Minato que a Gótica ainda não tinha:
 *  !reversevid  - inverte vídeo + áudio
 *  !videolento  - deixa o vídeo em câmera lenta
 *  !videorapido - acelera o vídeo
 *  !audiolento  - deixa o áudio lento
 *  !audiorapido - deixa o áudio rápido
 *  !slowvid / !fastvid (aliases)
 */

import { unlinkSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Filtros de áudio por comando. */
const AUDIO_FILTERS = {
    slow: 'atempo=0.9,asetrate=44100',
    audiolento: 'atempo=0.7,asetrate=44100',
    fast: 'atempo=1.6,asetrate=44100',
    audiorapido: 'atempo=1.6,asetrate=44100',
    bass2: 'equalizer=f=120:width_type=o:width=2:g=25',
    bass3: 'equalizer=f=60:width_type=o:width=2:g=35',
    slowed: 'atempo=0.85,asetrate=44100',
    speedup: 'atempo=1.25,asetrate=44100'
}

/** Filtros de vídeo por comando. */
const VIDEO_FILTERS = {
    reversevid: { vf: 'reverse', af: 'areverse' },
    videolento: { filter: '[0:v]setpts=2*PTS[v];[0:a]atempo=0.5[a]', map: true },
    videorapido: { filter: '[0:v]setpts=0.5*PTS[v];[0:a]atempo=1.6[a]', map: true },
    slowvid: { filter: '[0:v]setpts=1.8*PTS[v];[0:a]atempo=0.6[a]', map: true },
    fastvid: { filter: '[0:v]setpts=0.6*PTS[v];[0:a]atempo=1.4[a]', map: true }
}

/** Gera um nome aleatório. */
function getRandom(ext) {
    return `${Math.random().toString(36).slice(2)}${ext}`
}

const handler = async (m, { conn, command }) => {
    const cmd = (command || '').toLowerCase()
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q)?.mimetype || ''
    const isAudio = mime.startsWith('audio/')
    const isVideo = mime.startsWith('video/')

    const audioFilter = AUDIO_FILTERS[cmd]
    const videoFilter = VIDEO_FILTERS[cmd]

    if (!audioFilter && !videoFilter) {
        return m.reply('❌ Efeito não reconhecido.')
    }

    if (audioFilter && !isAudio) {
        return m.reply('❌ *Envie ou responda a um ÁUDIO!*\n\nUse o comando em um arquivo de áudio.')
    }
    if (videoFilter && !isVideo) {
        return m.reply('❌ *Envie ou responda a um VÍDEO!*\n\nUse o comando em um arquivo de vídeo.')
    }

    await m.react('⏳')
    try {
        const tmpDir = join(__dirname, '../tmp')
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

        const ext = mime.split('/')[1]?.split(';')[0] || (isVideo ? 'mp4' : 'mp3')
        const inputPath = join(tmpDir, getRandom(`.${ext}`))
        const outputPath = join(tmpDir, getRandom(isVideo ? '.mp4' : '.mp3'))

        const media = await q.download(true)
        if (!media) throw new Error('Erro ao baixar a mídia!')

        let cmdStr
        if (videoFilter) {
            if (videoFilter.map) {
                cmdStr = `ffmpeg -y -i "${inputPath}" -filter_complex "${videoFilter.filter}" -map "[v]" -map "[a]" "${outputPath}"`
            } else {
                cmdStr = `ffmpeg -y -i "${inputPath}" -vf ${videoFilter.vf} -af ${videoFilter.af} "${outputPath}"`
            }
        } else {
            cmdStr = `ffmpeg -y -i "${inputPath}" -filter:a "${audioFilter}" "${outputPath}"`
        }

        await execPromise(cmdStr)

        if (existsSync(media)) unlinkSync(media)
        if (!existsSync(outputPath)) throw new Error('Arquivo de saída não foi gerado.')

        const buff = readFileSync(outputPath)
        unlinkSync(outputPath)

        if (isVideo) {
            await conn.sendFile(m.chat, buff, getRandom('.mp4'), `🎬 *Efeito: ${cmd}*\n\n✨ Gótica Bot`, m, true, { type: 'videoMessage' })
        } else {
            await conn.sendFile(m.chat, buff, getRandom('.mp3'), `🎧 *Efeito: ${cmd}*\n\n✨ Gótica Bot`, m, true, { type: 'audioMessage', ptt: true })
        }
        await m.react('✅')
    } catch (e) {
        console.error('[VIDEO-EFFECTS]', e)
        await m.react('❌')
        m.reply(`❌ *Erro ao aplicar o efeito!*\n\n${e.message || 'Erro desconhecido.'}`)
    }
}

handler.help = ['reversevid', 'videolento', 'videorapido', 'audiolento', 'audiorapido', 'slowvid', 'fastvid']
handler.tags = ['convertidor', 'efeitos']
handler.command = ['reversevid', 'videolento', 'videorapido', 'audiolento', 'audiorapido',
    'slowvid', 'fastvid', 'bass2', 'bass3', 'slowed', 'speedup']

export default handler
