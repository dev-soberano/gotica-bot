/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Para que serve: IA que responde textos e analisa imagens enviadas/marcadas.
    // Como usar: .ia qual a capital do Brasil? ou marque uma foto com .ia
    // Público: Todos (Membros, ADMs e Dono). Sem trava de registro.

    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    
    // Prompt de personalidade neutro para o público
    const basePrompt = `Seu nome é Gótica IA. Você foi criada pelo dev Leandro Rocha. Você é amigável, divertida e gosta de aprender. Responda sempre em Português. Você está falando com ${username}.`

    if (isQuotedImage) {
        const q = m.quoted
        const img = await q.download?.()
        if (!img) {
            return conn.reply(m.chat, '*┇┆❌ Erro:* Não foi possível baixar a imagem para análise.', m)
        }
        
        try {
            await m.react('🔍')
            const content = `O que você vê nesta imagem?`
            const imageAnalysis = await fetchImageBuffer(content, img)
            
            const query = `Descreva esta imagem em detalhes. Também diga quem é você.`
            const prompt = `${basePrompt}. A imagem analisada contém: ${imageAnalysis.result}`
            
            const description = await luminsesi(query, username, prompt)
            await conn.reply(m.chat, description, m)
            await m.react('✅')
        } catch (e) {
            console.error(e)
            await m.react('❌')
            await conn.reply(m.chat, '*┇┆❌ Erro:* A IA não conseguiu analisar a imagem agora.', m)
        }
    } else {
        if (!text) return conn.reply(m.chat, `*┇┆🔍 O que deseja saber?*\n\nExemplo: *${usedPrefix + command} Como fazer um bolo?*`, m)
        
        await m.react('🧠')
        try {
            // Mensagem de processamento
            const { key } = await conn.sendMessage(m.chat, { text: `*┇┆⏳ Processando sua pergunta...*` }, { quoted: m })
            
            const query = text
            const prompt = `${basePrompt}. Responda o seguinte: ${query}`
            const response = await luminsesi(query, username, prompt)
            
            // Edita a mensagem com a resposta final
            await conn.sendMessage(m.chat, { text: `${response}\n\n*✧ Dev: Leandro Rocha*`, edit: key })
            await m.react('✅')
        } catch (e) {
            console.error(e)
            await m.react('❌')
            await conn.reply(m.chat, '*┇┆⚠️ Erro:* Não foi possível obter uma resposta da IA agora.', m)
        }
    }
}

handler.help = ['ia', 'chatgpt']
handler.tags = ['ai']
handler.command = ['ia', 'chatgpt', 'luminai']

// Removido handler.register e handler.group para ser livre para todos
export default handler

// Função para enviar uma imagem e obter o análise
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://Luminai.my.id', {
            content: content,
            imageBuffer: imageBuffer.toString('base64') // Convertendo para base64 para evitar erro de buffer
        }, {
            headers: { 'Content-Type': 'application/json' }
        })
        return response.data
    } catch (error) {
        throw error
    }
}

// Função para interagir com a IA usando prompts
async function luminsesi(q, username, logic) {
    try {
        const response = await axios.post("https://Luminai.my.id", {
            content: q,
            user: username,
            prompt: logic,
            webSearchMode: false
        })
        return response.data.result
    } catch (error) {
        throw error
    }
}