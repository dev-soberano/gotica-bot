/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

// Fator de crescimento baseado na Proporção Áurea e constantes matemáticas
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * .75

/**
 * Calcula o intervalo de XP para um determinado nível
 * @param {Number} level 
 * @param {Number} multiplier 
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
    if (level < 0) throw new TypeError('O nível não pode ser um valor negativo')
    level = Math.floor(level)
    let min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
    let max = Math.round(Math.pow(++level, growth) * multiplier)
    return {
        min,
        max,
        xp: max - min
    }
}

/**
 * Encontra o nível correspondente a uma quantidade de XP
 * @param {Number} xp 
 * @param {Number} multiplier 
 */
export function findLevel(xp, multiplier = global.multiplier || 1) {
    if (xp === Infinity) return Infinity
    if (isNaN(xp)) return NaN
    if (xp <= 0) return -1
    let level = 0
    do
        level++
    while (xpRange(level, multiplier).min <= xp)
    return --level
}

/**
 * Verifica se o usuário pode subir de nível
 * @param {Number} level 
 * @param {Number} xp 
 * @param {Number} multiplier 
 */
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
    if (level < 0) return false
    if (xp === Infinity) return true
    if (isNaN(xp)) return false
    if (xp <= 0) return false
    return level < findLevel(xp, multiplier)
}