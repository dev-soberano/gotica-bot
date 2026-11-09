/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

import { readdirSync, existsSync, readFileSync, watch } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta)
const pluginFolder = Helper.__dirname(join(__dirname, '../plugins/index'))
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

let watcher, plugins, pluginFolders = []
watcher = plugins = {}

/**
 * Inicializa os arquivos de plugins
 */
async function filesInit(pFolder = pluginFolder, pFilter = pluginFilter, conn) {
    const folder = resolve(pFolder)
    if (folder in watcher) return
    pluginFolders.push(folder)

    await Promise.all(readdirSync(folder).filter(pFilter).map(async filename => {
        try {
            let file = global.__filename(join(folder, filename))
            const module = await import(file)
            if (module) plugins[filename] = 'default' in module ? module.default : module
        } catch (e) {
            conn?.logger.error(`Erro ao carregar plugin: ${filename}\n${format(e)}`)
            delete plugins[filename]
        }
    }))

    const watching = watch(folder, reload.bind(null, conn, folder, pFilter))
    watching.on('close', () => deletePluginFolder(folder, true))
    watcher[folder] = watching

    return plugins
}

/**
 * Remove uma pasta de plugins do monitoramento
 */
function deletePluginFolder(folder, isAlreadyClosed = false) {
    const resolved = resolve(folder)
    if (!(resolved in watcher)) return
    if (!isAlreadyClosed) watcher[resolved].close()
    delete watcher[resolved]
    pluginFolders.splice(pluginFolders.indexOf(resolved), 1)
}

/**
 * Recarrega um plugin específico quando ele é alterado
 */
async function reload(conn, pFolder = pluginFolder, pFilter = pluginFilter, _ev, filename) {
    if (pFilter(filename)) {
        let dir = global.__filename(join(pFolder, filename), true)
        if (filename in plugins) {
            if (existsSync(dir)) conn?.logger.info(` Plugin atualizado: '${filename}'`)
            else {
                conn?.logger.warn(` Plugin deletado: '${filename}'`)
                return delete plugins[filename]
            }
        } else conn?.logger.info(` Novo plugin detectado: '${filename}'`)

        let err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true
        })

        if (err) conn?.logger.error(`Erro de sintaxe em '${filename}'\n${format(err)}`)
        else try {
            const module = await importFile(global.__filename(dir)).catch(console.error)
            if (module) plugins[filename] = module
        } catch (e) {
            conn?.logger.error(`Erro ao requerer plugin '${filename}'\n${format(e)}`)
        } finally {
            // Mantém os plugins organizados por ordem alfabética
            plugins = Object.fromEntries(Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b)))
        }
    }
}

export { 
    pluginFolder, 
    pluginFilter, 
    plugins, 
    watcher, 
    pluginFolders, 
    filesInit, 
    deletePluginFolder, 
    reload 
}