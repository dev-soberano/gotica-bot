/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    const apiKeys = [
        '377a576cf1mshec53a3d9ff35714p1d9884jsn4749e1861bba', // CHAVE 1
        '4e61f221e1msh8d02792557a1937p1c822fjsn459f1d89968b', // CHAVE 2
        '0e8051bfbdmsh4a65402152f1739p144c60jsn8f077e3708ab', // CHAVE 3
        '3edfB5m8XuOFVPijpgGE'  // ✨ CHAVE PAGA (Reserva)
    ]
    const apiHost = 'spotify-downloader9.p.rapidapi.com'
    
    if (!text) return conn.reply(m.chat, `*🎧 diga o nome da música.*`, m)

    await conn.sendPresenceUpdate('recording', m.chat)
    await m.react('🎧')

    let downloadUrl = null
    let usedKeyIndex = -1

    for (let i = 0; i < apiKeys.length; i++) {
        let key = apiKeys[i]
        try {
            await conn.sendPresenceUpdate('recording', m.chat)
            const headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': apiHost }
            
            let sRes = await fetch(`https://${apiHost}/search?q=${encodeURIComponent(text)}&type=track&limit=1`, { headers })
            
            if (sRes.status === 429) {
                console.log(`[!] CHAVE ${i + 1} esgotada. Tentando a próxima...`)
                continue
            }

            let sJson = await sRes.json()
            let trackId = sJson?.data?.tracks?.items?.[0]?.id || 
                          sJson?.data?.items?.[0]?.id || 
                          sJson?.items?.[0]?.id

            if (!trackId) continue

            let dlRes = await fetch(`https://${apiHost}/downloadSong?songId=${trackId}`, { headers })
            let dlJson = await dlRes.json()

            if (dlJson.success && (dlJson.data?.downloadLink || dlJson.downloadLink)) {
                downloadUrl = dlJson.data?.downloadLink || dlJson.downloadLink
                usedKeyIndex = i + 1
                break 
            }
        } catch (err) {
            console.log(`[ERRO] Falha na CHAVE ${i + 1}: ${err.message}`)
            continue 
        }
    }

    if (!downloadUrl) {
        await m.react('❌')
        return m.reply('*❌ Erro:* Não consegui obter o link de download. Tente novamente.')
    }

    // Log numerado para o Soberano
    console.log(`[OK] Sucesso com a CHAVE ${usedKeyIndex === 4 ? 'PAGA (RESERVA)' : usedKeyIndex}`)

    try {
        await conn.sendPresenceUpdate('recording', m.chat)
        await conn.sendMessage(m.chat, { 
            audio: { url: downloadUrl }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: m })
        await m.react('✅')
    } catch (sendError) {
        console.log(`[!] Erro ao enviar áudio: ${sendError.message}`)
        // Se der erro de conexão (hang up), tenta enviar como documento ou avisa
        m.reply('*⚠️ Erro de conexão ao enviar o áudio. O servidor da música caiu. Tente novamente.*')
    }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = ['spotify', 'sp', 'splay']
handler.group = true
handler.register = false 

export default handler