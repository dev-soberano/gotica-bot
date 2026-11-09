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
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 60 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para calcular novamente.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (!text) return m.reply(`*Por favor, digite a equação!*\n\n> Exemplo: *${usedPrefix + command} 10 + 50*`)

    let val = text
        .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π|pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E')
        .replace(/\/+/g, '/')
        .replace(/\++/g, '+')
        .replace(/-+/g, '-')

    let format = val
        .replace(/Math\.PI/g, 'π')
        .replace(/Math\.E/g, 'e')
        .replace(/\//g, '÷')
        .replace(/\*/g, '×')

    try {
        let result = (new Function('return ' + val))()
        if (result === undefined || isNaN(result)) throw new Error()
        
        await m.reply(`*🔢 CALCULADORA*\n\n*Expressão:* ${format}\n*Resultado:* _${result}_`)
    } catch (e) {
        return m.reply(`*❌ ERRO:* Formato incorreto. Use apenas números e os símbolos: *-, +, *, /, π, e, ( )*`)
    }
}

handler.help = ['calc <equação>']
handler.tags = ['tools']
handler.command = ['cal', 'calc', 'calcular', 'calculadora']
handler.register = false // TRAVA REMOVIDA PARA SEMPRE

export default handler