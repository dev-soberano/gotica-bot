/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 *
 * @project Gótica Bot - Cliente de efeitos de texto (ephoto360)
 * @author Dev Soberano
 * @link https://github.com/leandromemes
 *
 * Implementação própria do fluxo do ephoto360.
 *
 * A biblioteca `imagemaker.js` derruba o processo inteiro quando a URL
 * do efeito não existe (o `JSON.parse` estoura dentro de um callback do
 * `request` e vira uma "uncaught exception"). Aqui tudo é tratado com
 * try/catch e erros viram `null`, então um efeito quebrado apenas
 * devolve uma mensagem de erro ao usuário.
 *
 * Fluxo:
 *   1. GET  página do efeito  -> extrai servidor, token e tipos
 *   2. POST página do efeito  -> devolve o payload em #form_value_input
 *   3. POST /effect/create-image -> devolve o JSON final com a imagem
 */

import axios from 'axios'
import cheerio from 'cheerio'

const HEADERS = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

/**
 * O ephoto360 exige um PHPSESSID válido: sem cookie a página de
 * criação não devolve o formulário e o fluxo quebra.
 */
function comSessao() {
    const dia = String(Date.now()).slice(0, 10)
    return {
        ...HEADERS,
        'Cookie': [
            `_gid=GA1.2.694836508.${dia}`,
            `__gads=ID=e77077076c5a18dc-223769e4b3cf00de:T=${dia}:RT=${dia}:S=ALNI_MZ54A8a-CdUL0GH7R1OPfiwplOIyQ`,
            `PHPSESSID=1b2hk17njmimvuim3celdji3q3`,
            `_ga=GA1.1.170505887.${dia}`,
            `_ga_SK0KDDQM5P=GS1.1.${dia}.2.1.${dia}.0`
        ].join('; ')
    }
}

/**
 * Baixa uma string aleatória para ser usada como `autocomplete0`.
 */
function randomToken() {
    const letras = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let out = ''
    for (let i = 0; i < 8; i++) out += letras[Math.floor(Math.random() * letras.length)]
    return out
}

/**
 * Gera uma imagem de texto com o efeito informado.
 *
 * Alguns efeitos têm várias variações (radio). Escolher uma variação
 * quebrada faz o site devolver erro, então aqui tentamos as variações
 * em ordem até uma funcionar.
 *
 * @param {string} url  Página do efeito no ephoto360
 * @param {string[]} texto  Linhas de texto
 * @returns {Promise<string|null>} URL da imagem ou null se falhar
 */
export async function criarTexto(url, texto = []) {
    try {
        const headers = comSessao()
        const linhas = Array.isArray(texto) ? texto : [String(texto || '')]
        const palavras = linhas.filter(Boolean)
        if (!palavras.length) return null

        // ── 1. Página do efeito ──
        const pagina = await axios.get(url, { headers, timeout: 20000 })
        const $ = cheerio.load(pagina.data)

        const servidor = $('#build_server').val()
        const servidorId = $('#build_server_id').val()
        const token = $('#token').val()

        if (!servidor || !token) return null

        // Variações de estilo disponíveis no efeito (ex.: cor, sombra).
        const tipos = []
        $('input[name="radio0[radio]"]').each((_, el) => {
            const valor = $(el).attr('value')
            if (valor && !tipos.includes(valor)) tipos.push(valor)
        })

        // Tenta cada variação e, por último, sem variação nenhuma.
        const tentativas = [...tipos.map(v => ({ radio: v })), { radio: null }]

        // O site falha de vez em quando sem motivo aparente; uma segunda
        // volta costuma resolver.
        for (let volta = 0; volta < 2; volta++) {
            for (const tentativa of tentativas) {
                const imagem = await criarComVariacao(url, servidor, servidorId, token, palavras, tentativa.radio, headers)
                if (imagem) return imagem
            }
        }

        return null
    } catch (e) {
        return null
    }
}

/**
 * Executa o POST do formulário + criação da imagem com uma variação.
 */
async function criarComVariacao(url, servidor, servidorId, token, palavras, radio, headers) {
    try {
        // O corpo precisa ser urlencoded com a chave `text` repetida
        // (uma vez por linha). O axios transformaria um array em
        // `text[]=`, que o site não entende.
        const corpo = new URLSearchParams()
        corpo.append('autocomplete0', randomToken())
        if (radio) corpo.append('radio0[radio]', radio)
        for (const linha of palavras) corpo.append('text', linha)
        corpo.append('submit', 'GO')
        corpo.append('token', token)
        corpo.append('build_server', servidor)
        corpo.append('build_server_id', String(servidorId))

        // ── 2. Submit do formulário ──
        const submetido = await axios.post(url, corpo.toString(), {
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 25000
        })

        const $$ = cheerio.load(submetido.data)
        const bruto = $$('#form_value_input').val()

        if (!bruto) return null

        let payload
        try {
            payload = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        } catch (e) {
            return null
        }

        // ── 3. Criação final da imagem ──
        const final = await axios.post('https://en.ephoto360.com/effect/create-image', payload, {
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 25000
        })

        const dados = typeof final.data === 'string' ? JSON.parse(final.data) : final.data
        if (!dados?.image) return null

        return servidor + dados.image
    } catch (e) {
        return null
    }
}

/**
 * Verifica se a página de um efeito existe e é utilizável.
 */
export async function efeitoValido(url) {
    try {
        const pagina = await axios.get(url, { headers: comSessao(), timeout: 15000 })
        const $ = cheerio.load(pagina.data)
        return !!$('#build_server').val() && !!$('#token').val()
    } catch (e) {
        return false
    }
}

export default { criarTexto, efeitoValido }
