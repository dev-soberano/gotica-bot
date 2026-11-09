/**
 * Valida todas as URLs do mapa de efeitos de logo.
 * Gera a imagem de verdade para cada efeito e reporta as falhas.
 *
 * Uso: node scripts/test-efeitos-logos.js
 */
import { criarTexto } from '../lib/ephoto360.js'
import { EFEITOS } from '../plugins/tools-logos-efeitos.js'

const ok = []
const fail = []

// O ephoto360 estrangula requisições em sequência, então o teste
// precisa de uma pausa entre uma efeito e outro.
const PAUSA_MS = Number(process.env.PAUSA_MS || 1200)
const esperar = () => new Promise(r => setTimeout(r, PAUSA_MS))

const nomes = Object.keys(EFEITOS)
for (const nome of nomes) {
    try {
        const img = await criarTexto(EFEITOS[nome], ['Gótica'])
        if (img) {
            ok.push(nome)
            console.log('[OK]   ' + nome.padEnd(18) + ' ' + img.slice(0, 70))
        } else {
            fail.push(nome)
            console.log('[FALHA] ' + nome.padEnd(18) + ' retornou vazio')
        }
    } catch (e) {
        fail.push(nome)
        console.log('[ERRO]  ' + nome.padEnd(18) + ' ' + e.message)
    }
    await esperar()
}

console.log('\n' + '='.repeat(50))
console.log('OK: ' + ok.length + ' | FALHA: ' + fail.length)
if (fail.length) console.log('Falhas: ' + fail.join(', '))

process.exit(0)
