/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'
import cheerio from 'cheerio'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 10 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) return
        cooldowns[m.sender] = Date.now()
    }

    if (!text) return m.reply(`*📚 Soberano, o que deseja buscar na Wikipedia?*\n\n*Exemplo:* ${usedPrefix + command} Naruto`)

    await m.react('📚')

    try {
        // Headers adicionados para evitar o erro 403 Forbidden
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        }

        const link = await axios.get(`https://pt.wikipedia.org/wiki/${encodeURIComponent(text)}`, options)
        const $ = cheerio.load(link.data)
        
        let wik = $('#firstHeading').text().trim()
        let resulw = $('#mw-content-text > div.mw-parser-output').find('p').text().trim()

        // Filtrar parágrafos vazios que a wiki às vezes retorna no início
        if (!resulw || resulw.length < 50) {
            resulw = $('#mw-content-text > div.mw-parser-output').find('p').eq(1).text().trim()
        }

        if (!resulw || resulw.length < 10) throw 'Conteúdo não encontrado'

        let mensagem = `*📚 WIKIPÉDIA - RESULTADO*\n\n`
        mensagem += `*🔍 Buscado:* ${wik}\n\n`
        mensagem += `${resulw.slice(0, 1500)}...` 

        await m.reply(mensagem)
        await m.react('✅')

    } catch (e) {
        console.error('Erro na Wiki:', e.message)
        await m.react('❌')
        m.reply(`*❌ Não foram encontrados resultados para "${text}".*\n\n*Dica:* Tente buscar termos mais específicos ou nomes próprios.`)
    }
}

handler.help = ['wikipedia <termo>']
handler.tags = ['tools']
handler.command = ['wiki', 'wikipedia']
handler.register = false 

export default handler