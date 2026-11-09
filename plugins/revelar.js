import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verifica se há uma mensagem respondida ou se a própria mensagem tem mídia
    let q = m.quoted ? m.quoted : m
    // Detecta visualização única ou mídia comum
    let viewOnce = q.viewOnce || q.msg?.viewOnce
    let mime = (q.msg || q).mimetype || ''
    // visualização única vem embrulhada: usa o tipo real da mídia (desembrulhado)
    if (!mime && q.mediaType) mime = q.mediaType === 'imageMessage' ? 'image/jpeg' : 'video/mp4'

    if (!/image|video/.test(mime)) {
        return m.reply(`⭐ responda a uma imagem ou vídeo de visualização única para revelar! 💋`)
    }

    await m.react('⏳')

    try {
        // Download da mídia (Baileys lida com o buffer)
        let media = await q.download?.()
        if (!media) return m.reply('⭐ *Erro:* Não consegui baixar a mídia. 💋')

        const isImage = mime.includes('image')
        const filename = Date.now()
        const inputPath = `./tmp/${filename}_in`
        const outputPath = `./tmp/${filename}.${isImage ? 'jpg' : 'mp4'}`

        if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
        fs.writeFileSync(inputPath, media)

        // Comando FFmpeg para garantir que o arquivo seja convertido corretamente e não bugue
        const ffmpegCmd = isImage 
            ? `ffmpeg -y -i "${inputPath}" -q:v 2 "${outputPath}"`
            : `ffmpeg -y -i "${inputPath}" -c copy "${outputPath}"`

        exec(ffmpegCmd, async (err) => {
            if (err) {
                console.error(err)
                await m.react('❌')
                return m.reply('⭐ *Erro ao revelar mídia.* 💋')
            }

            const caption = `🌀 *REVELADO COM SUCESSO* 🌀\n\n⭐ *Tipo:* ${isImage ? 'Imagem' : 'Vídeo'}\n💋 *Gótica Bot*`

            if (isImage) {
                await conn.sendMessage(m.chat, { image: fs.readFileSync(outputPath), caption }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: fs.readFileSync(outputPath), caption, mimetype: 'video/mp4' }, { quoted: m })
            }

            await m.react('✅')

            // Limpeza de arquivos temporários
            setTimeout(() => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
            }, 2000)
        })

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⭐ *Ops!* Deu erro no sistema de revelação. 💋')
    }
}

handler.help = ['revelar', 'rv']
handler.tags = ['tools']
handler.command = /^(revelar|rv|reveal)$/i

export default handler