import axios from 'axios'

// Configurações
const API_KEY = '4eb3bed77c48b0ef28b18bb6fceee379d86290517a884e7d7c01c1839d69ed2a'
const API_URL = 'https://apicpf.com/api/consulta'

/**
 * Extrai dia, mês e ano numéricos da string de data
 */
function extrairData(dataNascStr) {
  if (!dataNascStr) return null

  let ano, mes, dia
  if (dataNascStr.includes('-')) {
    ;[ano, mes, dia] = dataNascStr.split('-').map(Number)
  } else if (dataNascStr.includes('/')) {
    ;[dia, mes, ano] = dataNascStr.split('/').map(Number)
  } else {
    return null
  }

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null
  return { dia, mes, ano }
}

/**
 * Calcula a idade exata
 */
function calcularIdade(dataParsed) {
  if (!dataParsed) return 'Não informada'

  const { dia, mes, ano } = dataParsed
  const hoje = new Date()
  let idade = hoje.getFullYear() - ano
  const m = hoje.getMonth() + 1 - mes

  if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
    idade--
  }

  return isNaN(idade) ? 'Não informada' : `${idade} anos`
}

/**
 * Descobre o Signo do Zodíaco com base no dia e mês
 */
function obterSigno(dia, mes) {
  if (!dia || !mes) return 'Não informado'

  const signos = [
    { nome: 'Capricórnio ♑', inicio: [1, 1], fim: [1, 19] },
    { nome: 'Aquário ♒', inicio: [1, 20], fim: [2, 18] },
    { nome: 'Peixes ♓', inicio: [2, 19], fim: [3, 20] },
    { nome: 'Áries ♈', inicio: [3, 21], fim: [4, 19] },
    { nome: 'Touro ♉', inicio: [4, 20], fim: [5, 20] },
    { nome: 'Gêmeos ♊', inicio: [5, 21], fim: [6, 20] },
    { nome: 'Câncer ♋', inicio: [6, 21], fim: [7, 22] },
    { nome: 'Leão ♌', inicio: [7, 23], fim: [8, 22] },
    { nome: 'Virgem ♍', inicio: [8, 23], fim: [9, 22] },
    { nome: 'Libra ♎', inicio: [9, 23], fim: [10, 22] },
    { nome: 'Escorpião ♏', inicio: [10, 23], fim: [11, 21] },
    { nome: 'Sagitário ♐', inicio: [11, 22], fim: [12, 21] },
    { nome: 'Capricórnio ♑', inicio: [12, 22], fim: [12, 31] }
  ]

  for (const s of signos) {
    const [mesIn, diaIn] = s.inicio
    const [mesFim, diaFim] = s.fim
    if (
      (mes === mesIn && dia >= diaIn) ||
      (mes === mesFim && dia <= diaFim)
    ) {
      return s.nome
    }
  }

  return 'Não informado'
}

/**
 * Infere o gênero com base no primeiro nome caso a API retorne Indefinido
 */
function inferirGeneroPorNome(nomeCompleto) {
  if (!nomeCompleto) return 'Não informado'

  const primeiroNome = nomeCompleto.trim().split(' ')[0].toLowerCase()

  const excecoesMasculinas = ['luca', 'lucas', 'sasha', 'jean', 'andrea', 'borba', 'kaka']
  const excecoesFemininas = ['raquel', 'isabel', 'beatriz', 'alices', 'iris', 'ruth']

  if (excecoesMasculinas.includes(primeiroNome)) return 'Masculino'
  if (excecoesFemininas.includes(primeiroNome)) return 'Feminino'

  if (primeiroNome.endsWith('a')) {
    return 'Feminino'
  }

  return 'Masculino'
}

/**
 * Formata o código do gênero vindo da API
 */
function formatarGenero(generoApi, nomeCompleto) {
  if (generoApi === 'M' || generoApi === 'Masculino') return 'Masculino'
  if (generoApi === 'F' || generoApi === 'Feminino') return 'Feminino'

  return inferirGeneroPorNome(nomeCompleto)
}

/**
 * Formata a data para o padrão brasileiro DD/MM/YYYY
 */
function formatarData(dataStr) {
  if (!dataStr) return 'Não informada'
  if (dataStr.includes('/')) return dataStr

  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`🔍 *Uso correto:* ${usedPrefix + command} <CPF>\n\n*Exemplo:* ${usedPrefix + command} 12345678900`)
  }

  const cpfLimpo = args[0].replace(/\D/g, '')

  if (cpfLimpo.length !== 11) {
    return m.reply('❌ *Erro:* O CPF deve conter exatamente 11 dígitos numéricos.')
  }

  await m.reply('🔄 *Consultando base de dados... Por favor, aguarde.*')

  try {
    const response = await axios.get(`${API_URL}?cpf=${cpfLimpo}`, {
      headers: {
        'X-API-KEY': API_KEY
      },
      timeout: 10000
    })

    const data = response.data?.data

    if (!data) {
      return m.reply('❌ *Erro:* Dados não encontrados para o CPF informado.')
    }

    const nome = data.nome || 'Não informado'
    const generoFinal = formatarGenero(data.genero, nome)
    const dataNascimento = formatarData(data.data_nascimento)
    
    const dataParsed = extrairData(data.data_nascimento)
    const idade = calcularIdade(dataParsed)
    const signo = dataParsed ? obterSigno(dataParsed.dia, dataParsed.mes) : 'Não informado'

    const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

    const textoResposta = `
   *CONSULTA DE CPF*
━━━━━━━━━━━━━━━━━━━━━━━

👤 *Nome:* ${nome}
🆔 *CPF:* ${cpfFormatado}
🎂 *Nascimento:* ${dataNascimento}
⏳ *Idade:* ${idade}
🔮 *Signo:* ${signo}
🚻 *Gênero:* ${generoFinal}

━━━━━━━━━━━━━━━━━━━━━━━
✨ *Gotica bot - Consulta de Dados*
`.trim()

    await conn.sendMessage(m.chat, { text: textoResposta }, { quoted: m })

  } catch (error) {
    console.error('Erro na consulta de CPF:', error?.response?.data || error.message)

    if (error.response) {
      const status = error.response.status

      if (status === 404) {
        return m.reply('❌ *Pessoa não encontrada* com o CPF informado.')
      } else if (status === 429) {
        return m.reply('⚠️ *Limite da API atingido:* O limite de requisições por minuto ou diário foi excedido. Tente novamente mais tarde.')
      } else if (status === 401 || status === 403) {
        return m.reply('❌ *Erro de autenticação:* Chave de API inválida ou expirada.')
      }
    }

    return m.reply('❌ *Ocorreu um erro ao realizar a consulta.* Tente novamente em alguns instantes.')
  }
}

handler.help = ['cpf <numero>']
handler.tags = ['search', 'tools']
handler.command = /^(cpf|consultarcpf)$/i

export default handler