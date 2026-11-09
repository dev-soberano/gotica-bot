/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - RPG de Cidade
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Sistema de cidade completo portado do Minato: profissoes, casas,
 * veiculos, itens, crimes, hospital e mercado.
 * Os dados ficam em src/dados/cidade/<grupo>.json
 *
 *  !registrarcidade   - cria o personagem na cidade
 *  !perfilcidade      - mostra o perfil
 *  !trabalhar         - trabalha na profissao
 *  !settrabalho       - escolhe a profissao
 *  !cidadebanco       - operações bancarias
 *  !loja              - loja de itens
 *  !crimecidade       - comete um crime
 *  !hospitalcidade    - vai ao hospital
 *  !alugarcasa        - aluga uma casa
 *
 * Nota: crime, loja e trabalhar ja existem na base (plugins/econ-*.js).
 * Os equivalentes da cidade usam prefixo proprio (ex: crimecidade).
 */

import fs from 'fs'
import path from 'path'

const CIDADE_DIR = path.join(process.cwd(), 'src', 'dados', 'cidade')

/** Profissoes disponiveis. */
export const PROFISSOES = {
    '.': { nome: 'Desempregado', salario: 0, comida: 0 },
    'estagiario': { nome: 'Estagiario', salario: 150, comida: 10 },
    'vendedor': { nome: 'Vendedor', salario: 300, comida: 20 },
    'garcom': { nome: 'Garcom', salario: 450, comida: 30 },
    'programador': { nome: 'Programador', salario: 800, comida: 40 },
    'enfermeiro': { nome: 'Enfermeiro', salario: 900, comida: 40 },
    'policial': { nome: 'Policial', salario: 1100, comida: 50 },
    'mecanico': { nome: 'Mecanico', salario: 1000, comida: 45 },
    'taxista': { nome: 'Taxista', salario: 1200, comida: 50 },
    'advogado': { nome: 'Advogado', salario: 1800, comida: 60 },
    'medico': { nome: 'Medico', salario: 2500, comida: 70 },
    'engenheiro': { nome: 'Engenheiro', salario: 2200, comida: 60 },
    'gerente': { nome: 'Gerente', salario: 3000, comida: 80 },
    'empresario': { nome: 'Empresario', salario: 4500, comida: 100 },
    'magnata': { nome: 'Magnata', salario: 7000, comida: 150 }
}

/** Itens da loja. */
export const ITENS = {
    'pao': { nome: 'Pao', preco: 20, tipo: 'comida', fome: 30 },
    'carne': { nome: 'Carne', preco: 60, tipo: 'comida', fome: 60 },
    'pizza': { nome: 'Pizza', preco: 80, tipo: 'comida', fome: 70 },
    'suco': { nome: 'Suco', preco: 25, tipo: 'comida', fome: 25 },
    'cerveja': { nome: 'Cerveja', preco: 40, tipo: 'comida', fome: 35 },
    'remedio': { nome: 'Remedio', preco: 100, tipo: 'cura', cura: 50 },
    'escudo': { nome: 'Escudo', preco: 500, tipo: 'equip', defesa: 20 },
    'arma': { nome: 'Arma', preco: 800, tipo: 'equip', ataque: 25 },
    'bomba': { nome: 'Bomba', preco: 300, tipo: 'item' },
    'pocao': { nome: 'Pocao', preco: 250, tipo: 'cura', cura: 100 }
}

/** Veiculos. */
export const VEICULOS = {
    'bicicleta': { nome: 'Bicicleta', preco: 800, tipo: 'item' },
    'moto': { nome: 'Moto', preco: 5000, tipo: 'item' },
    'carro': { nome: 'Carro', preco: 25000, tipo: 'item' },
    'caminhao': { nome: 'Caminhao', preco: 60000, tipo: 'item' },
    'aviao': { nome: 'Aviao', preco: 400000, tipo: 'item' }
}

/** Le os dados da cidade de um grupo. */
export function readCidade(groupId) {
    const file = path.join(CIDADE_DIR, `${groupId}.json`)
    try {
        if (!fs.existsSync(file)) return null
        return JSON.parse(fs.readFileSync(file, 'utf-8'))
    } catch {
        return null
    }
}

/** Grava os dados da cidade de um grupo. */
export function writeCidade(groupId, data) {
    try {
        if (!fs.existsSync(CIDADE_DIR)) fs.mkdirSync(CIDADE_DIR, { recursive: true })
        fs.writeFileSync(path.join(CIDADE_DIR, `${groupId}.json`), JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/** Cria o personagem inicial. */
function novoPersonagem(userId, nome) {
    return {
        id: userId,
        nome: nome || 'Morador',
        coins: 500,
        fome: 100,
        vida: 100,
        xp: 0,
        nivel: 1,
        profissao: '.',
        inventario: {},
        casa: null,
        veiculo: null,
        empresa: null,
        crimes: 0,
        prisoes: 0,
        criadoEm: Date.now()
    }
}

/** Garante que o personagem exista. */
function getPersonagem(groupId, userId, nome) {
    const db = readCidade(groupId)
    if (!db) return null
    if (!db.personagens) db.personagens = {}
    if (!db.personagens[userId]) {
        db.personagens[userId] = novoPersonagem(userId, nome)
        writeCidade(groupId, db)
    }
    return db.personagens[userId]
}

const handler = async (m, { args, command, text, isSoberano, isAdmin, groupMetadata }) => {
    const cmd = (command || '').toLowerCase()

    // Todos os comandos de cidade precisam de grupo
    if (!m.isGroup) return m.reply(global.dfail('group'))

    const gid = m.chat
    const pid = m.sender
    const nome = m.pushName || 'Morador'

    // ---------- !registrarcidade ----------
    if (cmd === 'registrarcidade' || cmd === 'cidaderegistro') {
        let db = readCidade(gid)
        if (!db) {
            db = { personagens: {}, config: { moeda: '🪙', nome: 'Cidade' } }
            writeCidade(gid, db)
        }
        if (db.personagens?.[pid]) return m.reply('✅ *Você já está registrado nesta cidade!*')

        const p = novoPersonagem(pid, nome)
        db.personagens[pid] = p
        writeCidade(gid, db)

        return m.reply(`🏙️ *BEM-VINDO À CIDADE!*\n\n👤 *Nome:* ${p.nome}\n🪙 *Coins:* ${p.coins}\n💼 *Profissão:* ${PROFISSOES['.'].nome}\n\n💡 \`!trabalhar\` para começar a trabalhar`)
    }

    // A partir daqui exige personagem
    const p = getPersonagem(gid, pid, nome)
    if (!p) {
        return m.reply('🏙️ *Você ainda não se registrou na cidade!*\n\n💡 Use `!registrarcidade` para começar.')
    }

    // ---------- !perfilcidade ----------
    if (cmd === 'perfilcidade' || cmd === 'cidadeperfil' || cmd === 'perfil2' || cmd === 'cidadeprofile') {
        const prof = PROFISSOES[p.profissao] || PROFISSOES['.']
        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
        txt += `  🏙️ *PERFIL DA CIDADE*\n`
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        txt += `👤 *Nome:* ${p.nome}\n`
        txt += `💼 *Profissão:* ${prof.nome}\n`
        txt += `🪙 *Coins:* ${p.coins}\n`
        txt += `⭐ *XP:* ${p.xp} (Nível ${p.nivel})\n`
        txt += `❤️ *Vida:* ${p.vida}/100\n`
        txt += `🍽️ *Fome:* ${p.fome}/100\n`
        txt += `🏠 *Casa:* ${p.casa || 'Nenhuma'}\n`
        txt += `🚗 *Veículo:* ${p.veiculo || 'Nenhum'}\n`
        txt += `🏢 *Empresa:* ${p.empresa || 'Nenhuma'}\n`
        txt += `🚔 *Crimes:* ${p.crimes}\n`
        txt += `⛓️ *Prisões:* ${p.prisoes}`
        return m.reply(txt)
    }

    // ---------- !trabalhoscidade ----------
    if (cmd === 'trabalhoscidade' || cmd === 'profissoes') {
        let txt = `💼 *PROFISSÕES DISPONÍVEIS*\n\n`
        Object.entries(PROFISSOES).forEach(([k, v], i) => {
            txt += `${i + 1}. \`${k}\` — *${v.nome}* (${v.salario} 🪙)\n`
        })
        txt += `\n💡 \`!settrabalho <chave>\` para escolher`
        return m.reply(txt)
    }

    // ---------- !settrabalho ----------
    if (cmd === 'settrabalho') {
        const chave = (args[0] || '').toLowerCase()
        if (!PROFISSOES[chave]) {
            return m.reply('❌ *Profissão inválida!*\n\n💡 `!trabalhoscidade` para ver a lista.')
        }
        p.profissao = chave
        writeCidade(gid, readCidade(gid))
        return m.reply(`✅ *Profissão definida!*\n\n💼 ${PROFISSOES[chave].nome}\n🪙 Salário: ${PROFISSOES[chave].salario}`)
    }

    // ---------- !trabalhar ----------
    if (cmd === 'trabalhar' || cmd === 'trabalharcidade' || cmd === 'comerdajob') {
        const prof = PROFISSOES[p.profissao] || PROFISSOES['.']
        if (!prof.salario) {
            return m.reply('💼 *Você está inativo no trabalho!*\n\n💡 Use `!settrabalho <profissão>` para escolher uma.')
        }
        if (p.fome <= 0) {
            return m.reply('🍽️ *Você está com fome demais para trabalhar!*\n\n💡 Compre comida na loja.')
        }

        const salario = prof.salario + Math.floor(Math.random() * 100)
        p.coins += salario
        p.fome = Math.max(0, p.fome - 20)
        p.xp += Math.floor(salario / 5)
        const xpNecessario = p.nivel * 100
        if (p.xp >= xpNecessario) {
            p.nivel++
            p.xp -= xpNecessario
            writeCidade(gid, readCidade(gid))
            return m.reply(`💼 *TRABALHO CONCLUÍDO!*\n\n💰 Salário: *${salario}* 🪙\n🪙 Total: *${p.coins}*\n\n🎉 *SUBIU DE NÍVEL!* → Nível *${p.nivel}*`)
        }
        writeCidade(gid, readCidade(gid))
        return m.reply(`💼 *TRABALHO CONCLUÍDO!*\n\n💰 Salário: *${salario}* 🪙\n🪙 Total: *${p.coins}* 🪙\n⭐ XP: *${p.xp}/${xpNecessario}*`)
    }

    // ---------- !salariocidade ----------
    if (cmd === 'salariocidade' || cmd === 'coletarsalario') {
        const prof = PROFISSOES[p.profissao] || PROFISSOES['.']
        if (!prof.salario) return m.reply('💼 *Você não tem salário!*')
        const salario = Math.floor(prof.salario * 0.8)
        p.coins += salario
        writeCidade(gid, readCidade(gid))
        return m.reply(`💰 *SALÁRIO RECEBIDO!*\n\n🪙 *+${salario}*\n💰 Total: *${p.coins}*`)
    }

    // ---------- !cidadebanco ----------
    if (cmd === 'cidadebanco' || cmd === 'bancocidade' || cmd === 'depositarbank' || cmd === 'sacarbanco') {
        const sub = (args[0] || '').toLowerCase()
        if (sub === 'depositar' || cmd === 'depositarbank') {
            const v = parseInt(args[1] || 100)
            if (p.coins < v) return m.reply('❌ *Coins insuficientes!*')
            p.coins -= v
            writeCidade(gid, readCidade(gid))
            return m.reply(`🏦 *DEPÓSITO FEITO!*\n\n🪙 *-${v}*\n💰 Saldo: *${p.coins}*`)
        }
        if (sub === 'sacar' || cmd === 'sacarbanco') {
            const v = parseInt(args[1] || 100)
            const taxa = Math.floor(v * 0.05)
            if (p.coins < v) return m.reply('❌ *Coins insuficientes!*')
            p.coins -= v + taxa
            writeCidade(gid, readCidade(gid))
            return m.reply(`🏦 *SAQUE FEITO!*\n\n🪙 *-${v}* (taxa ${taxa})\n💰 Saldo: *${p.coins}*`)
        }

        let txt = `🏦 *BANCO DA CIDADE*\n\n`
        txt += `💰 *Saldo:* ${p.coins} 🪙\n\n`
        txt += `💡 \`!cidadebanco depositar <valor>\` — depositar\n`
        txt += `💡 \`!cidadebanco sacar <valor>\` — sacar (taxa 5%)\n`
        txt += `💡 \`!loja\` — comprar itens`
        return m.reply(txt)
    }

    // ---------- !loja (cidade) ----------
    if (cmd === 'lojacidades' || cmd === 'lojaitenscidade' || cmd === 'lojararos') {
        let txt = `🛒 *LOJA DA CIDADE*\n\n`
        Object.entries(ITENS).forEach(([k, v], i) => {
            txt += `${i + 1}. \`${k}\` — *${v.nome}* (${v.preco} 🪙)\n`
        })
        txt += `\n💡 \`!compraritemcidade <item>\` — comprar`
        return m.reply(txt)
    }

    // ---------- !compraritemcidade ----------
    if (cmd === 'compraritemcidade' || cmd === 'compraritenscidade') {
        const item = (args[0] || '').toLowerCase()
        const cfg = ITENS[item]
        if (!cfg) return m.reply('❌ *Item inválido!*\n\n💡 `!loja` para ver a lista.')
        if (p.coins < cfg.preco) return m.reply(`❌ *Coins insuficientes!*\n\n💰 Você tem ${p.coins} 🪙\n🏷️ Custo: ${cfg.preco} 🪙`)

        p.coins -= cfg.preco
        p.inventario[item] = (p.inventario[item] || 0) + 1
        writeCidade(gid, readCidade(gid))
        return m.reply(`✅ *COMPRA REALIZADA!*\n\n🏷️ *${cfg.nome}*\n🪙 Custo: ${cfg.preco}\n💰 Saldo: ${p.coins}`)
    }

    // ---------- !inventariocidade ----------
    if (cmd === 'inventariocidade' || cmd === 'inventcidade') {
        const chaves = Object.keys(p.inventario).filter(k => p.inventario[k] > 0)
        let txt = `🎒 *INVENTÁRIO*\n\n`
        if (!chaves.length) {
            txt += `_Seu inventário está vazio._`
        } else {
            chaves.forEach(k => {
                const cfg = ITENS[k] || VEICULOS[k] || { nome: k }
                txt += `• *${cfg.nome}* x${p.inventario[k]}\n`
            })
        }
        txt += `\n\n💰 *Coins:* ${p.coins} 🪙`
        return m.reply(txt)
    }

    // ---------- !crimecidade ----------
    if (cmd === 'crimecidade') {
        if (p.vida < 30) return m.reply('❤️ *Você está muito ferido!* Vá ao hospital.')
        const sucesso = Math.random() < 0.6
        if (sucesso) {
            const premio = 200 + Math.floor(Math.random() * 600)
            p.coins += premio
            p.crimes++
            p.xp += 50
            writeCidade(gid, readCidade(gid))
            return m.reply(`💀 *CRIME BEM-SUCEDIDO!*\n\n🪙 *+${premio}*\n💰 Total: ${p.coins}\n⭐ +50 XP`)
        }
        p.vida = Math.max(0, p.vida - 30)
        p.prisoes++
        writeCidade(gid, readCidade(gid))
        return m.reply(`🚔 *VOCÊ FOI PEGO!*\n\n❤️ -30 vida\n⛓️ Prisão: ${p.prisoes}\n💡 Use \`!hospitalcidade\` para se recuperar.`)
    }

    // ---------- !hospitalcidade ----------
    if (cmd === 'hospitalcidade' || cmd === 'hospitalcity' || cmd === 'curarcidade') {
        const custo = 100
        if (p.coins < custo) return m.reply(`❌ *Coins insuficientes!*\n\n💰 Custo: ${custo} 🪙`)
        p.coins -= custo
        p.vida = 100
        p.fome = 100
        writeCidade(gid, readCidade(gid))
        return m.reply(`🏥 *TRATAMENTO CONCLUÍDO!*\n\n❤️ Vida: 100/100\n🍽️ Fome: 100/100\n🪙 Custo: ${custo}`)
    }

    // ---------- !mercadocidade ----------
    if (cmd === 'mercadocidade' || cmd === 'comidascidade') {
        let txt = `🍽️ *MERCADO*\n\n`
        Object.entries(ITENS).filter(([ v]) => v.tipo === 'comida').forEach(([k, v], i) => {
            txt += `${i + 1}. \`${k}\` — *${v.nome}* (${v.preco} 🪙, +${v.fome} fome)\n`
        })
        txt += `\n💡 \`!compraritemcidade <item>\` — comprar`
        return m.reply(txt)
    }

    // ---------- !alugarcasa / !comprarcasa / !minhacasa ----------
    if (cmd === 'alugarcasa' || cmd === 'comprarcasa' || cmd === 'minhacasa' || cmd === 'minhascasas' || cmd === 'vercasas' || cmd === 'casascidade') {
        if (cmd === 'minhacasa' || cmd === 'minhascasas') {
            return m.reply(`🏠 *SUA CASA*\n\n${p.casa ? `✅ *${p.casa}*` : '❌ Você não tem casa ainda.'}\n\n💡 \`!alugarcasa\` para alugar.`)
        }
        if (cmd === 'vercasas' || cmd === 'casascidade') {
            return m.reply(`🏠 *CASAS DISPONÍVEIS*\n\n1. *Quarto* — 500 🪙\n2. *Apartamento* — 2.000 🪙\n3. *Casa* — 5.000 🪙\n4. *Mansão* — 20.000 🪙\n\n💡 \`!alugarcasa <tipo>\``)
        }

        const tipo = (args[0] || '').toLowerCase()
        const casas = {
            quarto: { nome: 'Quarto', preco: 500 },
            apartamento: { nome: 'Apartamento', preco: 2000 },
            casa: { nome: 'Casa', preco: 5000 },
            mansao: { nome: 'Mansão', preco: 20000 }
        }
        const cfg = casas[tipo]
        if (!cfg) return m.reply('📝 *Uso:*\n!alugarcasa <quarto|apartamento|casa|mansao>')
        if (p.coins < cfg.preco) return m.reply(`❌ *Coins insuficientes!*\n\n💰 Custo: ${cfg.preco} 🪙`)

        p.coins -= cfg.preco
        p.casa = cfg.nome
        writeCidade(gid, readCidade(gid))
        return m.reply(`🏠 *CASA ALUGADA!*\n\n🏡 *${cfg.nome}*\n🪙 Custo: ${cfg.preco}\n💰 Saldo: ${p.coins}`)
    }

    // ---------- !assaltarcidade ----------
    if (cmd === 'assaltarcidade') {
        const sucesso = Math.random() < 0.45
        if (sucesso) {
            const premio = 300 + Math.floor(Math.random() * 700)
            p.coins += premio
            writeCidade(gid, readCidade(gid))
            return m.reply(`🔫 *ASSALTO BEM-SUCEDIDO!*\n\n🪙 *+${premio}*\n💰 Total: ${p.coins}`)
        }
        p.vida = Math.max(0, p.vida - 25)
        writeCidade(gid, readCidade(gid))
        return m.reply(`🚔 *VOCÊ FOI PEGO ASSALTANDO!*\n\n❤️ -25 vida`)
    }

    // ---------- !veiculoscidade ----------
    if (cmd === 'veiculoscidade' || cmd === 'comprarveiculo' || cmd === 'repararveiculo') {
        if (cmd === 'veiculoscidade') {
            let txt = `🚗 *VEÍCULOS DISPONÍVEIS*\n\n`
            Object.entries(VEICULOS).forEach(([k, v], i) => {
                txt += `${i + 1}. \`${k}\` — *${v.nome}* (${v.preco} 🪙)\n`
            })
            return m.reply(txt)
        }
        if (cmd === 'repararveiculo') {
            if (!p.veiculo) return m.reply('❌ *Você não tem veículo!*')
            const custo = 200
            if (p.coins < custo) return m.reply('❌ *Coins insuficientes!*')
            p.coins -= custo
            writeCidade(gid, readCidade(gid))
            return m.reply(`🔧 *Veículo reparado!*\n\n🚗 ${p.veiculo}\n🪙 Custo: ${custo}`)
        }

        const tipo = (args[0] || '').toLowerCase()
        const cfg = VEICULOS[tipo]
        if (!cfg) return m.reply('📝 *Uso:*\n!comprarveiculo <bicicleta|moto|carro|caminhao|aviao>')
        if (p.coins < cfg.preco) return m.reply(`❌ *Coins insuficientes!*\n\n💰 Custo: ${cfg.preco} 🪙`)

        p.coins -= cfg.preco
        p.veiculo = cfg.nome
        writeCidade(gid, readCidade(gid))
        return m.reply(`🚗 *VEÍCULO COMPRADO!*\n\n🚘 *${cfg.nome}*\n🪙 Custo: ${cfg.preco}`)
    }

    // ---------- !divorciarcidade ----------
    if (cmd === 'divorciarcidade' || cmd === 'divorciocidade') {
        let db = readCidade(gid)
        if (!db.casais) db.casais = []
        const parceiro = db.casais.find(c => c.a === pid || c.b === pid)
        if (!parceiro) return m.reply('💔 *Você não está casado na cidade.*')
        const outro = parceiro.a === pid ? parceiro.b : parceiro.a
        db.casais = db.casais.filter(c => c !== parceiro)
        writeCidade(gid, db)
        return m.reply(`💔 *DIVÓRCIO CONCLUÍDO!*\n\nVocê não está mais casado com @${outro.split('@')[0]}.`)
    }
}

handler.help = ['registrarcidade', 'perfilcidade', 'settrabalho', 'cidadebanco', 'crimecidade', 'hospitalcidade']
handler.tags = ['rpg', 'cidade']
handler.command = ['registrarcidade', 'cidaderegistro', 'perfilcidade', 'cidadeperfil', 'perfil2', 'cidadeprofile',
    'trabalhoscidade', 'profissoes', 'settrabalho', 'trabalharcidade', 'comerdajob',
    'salariocidade', 'coletarsalario', 'cidadebanco', 'bancocidade', 'depositarbank', 'sacarbanco',
    'lojacidades', 'lojaitenscidade', 'lojararos', 'compraritemcidade', 'compraritenscidade',
    'inventariocidade', 'inventcidade', 'crimecidade', 'hospitalcidade', 'hospitalcity',
    'curarcidade', 'mercadocidade', 'comidascidade', 'alugarcasa', 'comprarcasa', 'minhacasa',
    'minhascasas', 'vercasas', 'casascidade', 'assaltarcidade', 'veiculoscidade',
    'comprarveiculo', 'repararveiculo', 'divorciarcidade', 'divorciocidade']
handler.group = true

export default handler
