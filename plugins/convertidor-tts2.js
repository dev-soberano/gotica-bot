/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Vozes disponíveis na OpenAI: alloy, echo, fable, onyx, nova, shimmer
    const voces = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    
    let [v, ...t] = text.split(' ')
    let voice = voces.includes(v.toLowerCase()) ? v.toLowerCase() : 'nova' // 'nova' é uma voz feminina excelente
    let input = voces.includes(v.toLowerCase()) ? t.join(' ') : text

    if (!input && !m.quoted?.text) {
        return m.reply(`*✨ Como usar o TTS Premium (OpenAI):*\n\n*Exemplo:* ${usedPrefix + command} nova Olá, como você está?\n\n*Vozes disponíveis:* ${voces.join(', ')}\n\n> Se não escolher uma voz, usarei a 'nova' por padrão.`)
    }

    let textoFinal = input || m.quoted.text
    await m.react('🎙️')

    const options = {
        method: 'POST',
        url: 'https://open-ai-text-to-speech1.p.rapidapi.com/',
        headers: {
            'x-rapidapi-key': '377a576cf1mshec53a3d9ff35714p1d9884jsn4749e1861bba',
            'x-rapidapi-host': 'open-ai-text-to-speech1.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            model: 'tts-1',
            input: textoFinal,
            instructions: 'Fale de forma natural e humana, em português do Brasil.',
            voice: voice
        },
        responseType: 'arraybuffer' // Importante para receber o arquivo de áudio
    }

    try {
        const response = await axios.request(options)
        
        if (response.data) {
            await conn.sendMessage(m.chat, { 
                audio: Buffer.from(response.data), 
                fileName: 'openai_tts.mp3', 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: m })
            
            await m.react('✅')
        }
    } catch (error) {
        console.error('Erro na OpenAI TTS:', error)
        await m.react('❌')
        m.reply('*❌ Erro na API Premium. Verifique se sua chave RapidAPI tem saldo ou se o texto é muito longo.*')
    }
}

handler.help = ['openai <voz> <texto>']
handler.tags = ['transformador']
handler.command = /^(vozes|vozpremium|voz)$/i
handler.group = true
handler.register = false // Sem trava de registro conforme solicitado

export default handler