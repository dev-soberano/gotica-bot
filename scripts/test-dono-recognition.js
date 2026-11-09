import { pathToFileURL } from 'url'
import path from 'path'

const ROOT = process.cwd()

await import(pathToFileURL(path.join(ROOT, 'settings.js')).href)
const owners = await import(pathToFileURL(path.join(ROOT, 'lib', 'owners.js')).href)

const MEU = '556391096656'

console.log('\n=== global.owner ===')
console.log(JSON.stringify(global.owner, null, 2))

console.log('\n=== TESTES DE DONO ===')
const testes = [
    ['isDono (meu numero)', owners.isDono(`${MEU}@s.whatsapp.net`), true],
    ['isSoberano (meu numero)', owners.isSoberano(`${MEU}@s.whatsapp.net`), true],
    ['isDono (com +)', owners.isDono(`+${MEU}`), true],
    ['isDono (com 55)', owners.isDono(`55${MEU}`), true],
    ['isSoberano (com 55)', owners.isSoberano(`55${MEU}`), true],
    ['isDono (numero errado)', owners.isDono('5511999999999@s.whatsapp.net'), false],
    ['isModerador', typeof owners.isModerador(`${MEU}@s.whatsapp.net`), 'boolean'],
    ['isVip', typeof owners.isVip(`${MEU}@s.whatsapp.net`), 'boolean']
]

let falhas = 0
for (const [nome, got, want] of testes) {
    const ok = got === want
    if (!ok) falhas++
    console.log(`  ${ok ? '[OK]' : '[X] '} ${nome} -> ${got} (esperado ${want})`)
}

console.log('\n=== DONOS CADASTRADOS (owners.json) ===')
console.log(owners.getDonoSlots().map(s => `  ${s.nome}: ${s.num || '(vago)'}`).join('\n'))

console.log('\n=== TODOS OS DONOS ===')
console.log('  ' + owners.getAllOwners().join('\n  '))

console.log(falhas === 0 ? '\n[OK] DONO RECONHECIDO' : `\n[X] ${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
