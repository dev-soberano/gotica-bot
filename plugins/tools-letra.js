/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

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

    let [tipo, ...txt] = text.split(' ')
    let textoFinal = txt.join(' ')
    if (!textoFinal && m.quoted) textoFinal = m.quoted.text

    const fontes = {
        '1': { nome: 'Soft', map: {'a': 'ᥲ', 'b': 'ᑲ', 'c': 'ᥴ', 'd': 'ძ', 'e': 'ᥱ', 'f': '𝖿', 'g': 'g', 'h': 'һ', 'i': 'і', 'j': 'ȷ', 'k': 'k', 'l': 'ᥣ', 'm': 'm', 'n': 'ᥒ', 'o': '᥆', 'p': '⍴', 'q': '𝗊', 'r': 'r', 's': 's', 't': '𝗍', 'u': 'ᥙ', 'v': '᥎', 'w': 'ᥕ', 'x': '᥊', 'y': 'ᥡ', 'z': 'z'}},
        '2': { nome: 'Círculos', map: {'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'}},
        '3': { nome: 'Quadrados', map: {'a': '🄰', 'b': '🄱', 'c': '🄲', 'd': '🄳', 'e': '🄴', 'f': '🄵', 'g': '🄿', 'h': '🄻', 'i': '🄸', 'j': '🄹', 'k': '🄺', 'l': '🄻', 'm': '🄼', 'n': '🄽', 'o': '🄾', 'p': '🄿', 'q': '🅀', 'r': '🅁', 's': '🅂', 't': '🅃', 'u': '🅄', 'v': '🅅', 'w': '🅆', 'x': '🅇', 'y': '🅈', 'z': '🅉'}},
        '4': { nome: 'Subscrito', map: {'a': 'ₐ', 'b': '♭', 'c': '꜀', 'd': 'ᵈ', 'e': 'ₑ', 'f': '𝖿', 'g': '𝓰', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'q': 'q', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'w': 'ᵩ', 'x': 'ₓ', 'y': 'ᵧ', 'z': '₂'}}
    }

    if (!fontes[tipo] || !textoFinal) {
        let menu = `*✍️ ESTILOS DE LETRAS GÓTICA*\n\n`
        for (let f in fontes) {
            menu += `*${f}* - ${fontes[f].nome}\n`
        }
        menu += `\n*Exemplo:* ${usedPrefix + command} 2 Olá Mundo`
        return m.reply(menu)
    }

    let resultado = textoFinal.replace(/[a-z]/gi, v => fontes[tipo].map[v.toLowerCase()] || v)
    await m.reply(resultado)
}

handler.help = ['letra']
handler.tags = ['tools']
handler.command = ['fontes', 'font', 'estilo']
handler.register = false 

export default handler