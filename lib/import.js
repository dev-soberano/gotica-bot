/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

import Helper from './helper.js'

/**
 * Carrega módulos dinamicamente ignorando o cache do Node.js
 * Isso permite atualizar plugins em tempo real (Hot Reload)
 * @template T
 * @param {string} module - Caminho do módulo a ser importado
 * @returns {Promise<T>}
 */
export default async function importLoader(module) {
    // Converte o caminho para um formato válido
    module = Helper.__filename(module)
    
    /** * Importa o arquivo adicionando um parâmetro único de tempo (?id=...)
     * para enganar o sistema de cache do Node.js.
     */
    const module_ = await import(`${module}?id=${Date.now()}`)
    
    // Retorna o export padrão (default) ou o módulo completo
    const result = module_ && 'default' in module_ ? module_.default : module_
    
    return result
}