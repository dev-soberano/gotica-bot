/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'
const { proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent } = (await import("@whiskeysockets/baileys")).default

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verifica NSFW no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply('*🔞 Conteúdo adulto desativado neste grupo.*')
    }

    // Função para deixar o texto estilizado (Fancy)
    const toFancy = str => {
        const map = { 'a': 'ᥲ', 'b': 'ᑲ', 'c': 'ᥴ', 'd': 'ᑯ', 'e': 'ᥱ', 'f': '𝖿', 'g': 'g', 'h': 'һ', 'i': 'і', 'j': 'j', 'k': 'k', 'l': 'ᥣ', 'm': 'm', 'n': 'ᥒ', 'o': '᥆', 'p': '⍴', 'q': 'q', 'r': 'r', 's': 's', 't': '𝗍', 'u': 'ᥙ', 'v': '᥎', 'w': 'ɯ', 'x': 'x', 'y': 'ᥡ', 'z': 'z' };
        return str.split('').map(c => map[c] || c).join('')
    }

    async function createImageMessage(url) {
        const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: conn.waUploadToServer })
        return imageMessage
    }

    // Banco de Dados das Atrizes que você enviou
    const searchResults = [
        { pornStarName: "Remy LaCroix", picture: "https://cdni.pornpics.com/460/1/110/85205377/85205377_019_bd32.jpg", nationality: "US", galleries: "655" },
        { pornStarName: "Valentina Nappi", picture: "https://cdni.pornpics.com/460/7/432/17616538/17616538_126_38e5.jpg", nationality: "IT", galleries: "1187" },
        { pornStarName: "Madison Ivy", picture: "https://cdni.pornpics.com/460/5/222/59642255/59642255_002_e514.jpg", nationality: "DE", galleries: "903" },
        { pornStarName: "Blake Blossom", picture: "https://cdni.pornpics.com/460/7/95/15792130/15792130_085_8e27.jpg", nationality: "US", galleries: "173" },
        { pornStarName: "Little Caprice", picture: "https://cdni.pornpics.com/460/7/427/75245688/75245688_098_c8b6.jpg", nationality: "CZ", galleries: "474" },
        { pornStarName: "Alison Tyler", picture: "https://cdni.pornpics.com/460/5/195/12389984/12389984_016_9405.jpg", nationality: "US", galleries: "788" },
        { pornStarName: "Sasha Grey", picture: "https://cdni.pornpics.com/460/7/350/38447113/38447113_006_87d2.jpg", nationality: "US", galleries: "341" },
        { pornStarName: "Eva Elfie", picture: "https://cdni.pornpics.com/460/7/304/67674036/67674036_070_7a7d.jpg", nationality: "RU", galleries: "165" },
        { pornStarName: "Lexi Belle", picture: "https://cdni.pornpics.com/460/7/540/39668469/39668469_097_46e0.jpg", nationality: "US", galleries: "1173" },
        { pornStarName: "Kimmy Granger", picture: "https://cdni.pornpics.com/460/7/360/91501365/91501365_091_0817.jpg", nationality: "US", galleries: "580" }
    ]

    try {
        await m.react('🕒')
        
        // Embaralha e pega 7 resultados
        let shuffled = searchResults.sort(() => 0.5 - Math.random())
        let selectedResults = shuffled.slice(0, 7)
        
        let results = []
        for (let result of selectedResults) {
            results.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ 
                    text: toFancy(`Nacionalidade: ${result.nationality}\nGalerias: ${result.galleries}`) 
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
                    text: toFancy('Gótica Bot - Modelos') 
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: toFancy(result.pornStarName),
                    hasMediaAttachment: true,
                    imageMessage: await createImageMessage(result.picture)
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: toFancy("ver perfil"),
                            url: "https://www.google.com/search?q=" + encodeURIComponent(result.pornStarName)
                        })
                    }]
                })
            })
        }

        const responseMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `\n ${toFancy("Aqui estᥲo ᥲs m᥆ᑯᥱᥣ᥆s sᥙgᥱrіᑯᥲs:")}\n` 
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ 
                            text: toFancy("NSFW - MODEL SEARCH") 
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards: [...results]
                        })
                    })
                }
            }
        }, { quoted: m })

        await m.react('✅')
        await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id })

    } catch (error) {
        await m.react('❌')
        console.error(error)
        await conn.reply(m.chat, 'Ocorreu um erro ao gerar o catálogo.', m)
    }
}

handler.help = ['modelos']
handler.tags = ['+18']
handler.command = ['modelos', 'atrizes', 'catalogonsfw']
handler.group = true
handler.register = false

export default handler