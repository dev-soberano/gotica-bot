/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: Dev Soberano
 * * GitHub: https://github.com/leandromemes
 */

import { resolve, dirname as _dirname } from 'path'
import _fs, { existsSync, readFileSync } from 'fs'
const { promises: fs } = _fs

class Database {
    /**
     * Cria uma nova instância de gerenciamento de banco de dados
     * @param {String} filepath - Caminho para o arquivo JSON
     * @param  {...any} args - Argumentos extras para o JSON.stringify
     */
    constructor(filepath, ...args) {
        this.file = resolve(filepath)
        this.logger = console

        // Carrega os dados assim que o bot inicia
        this._load()

        this._jsonargs = args
        this._state = false
        this._queue = []
        
        // Intervalo de segurança: Salva os dados a cada 1 segundo se houver fila
        this._interval = setInterval(async () => {
          if (!this._state && this._queue && this._queue[0]) {
            this._state = true
            await this[this._queue.shift()]().catch(this.logger.error)
            this._state = false
          }
        }, 1000)
    }

    // Retorna os dados atuais
    get data() {
        return this._data
    }

    // Define novos dados e coloca na fila para salvar
    set data(value) {
        this._data = value
        this.save()
    }

    // Adiciona o carregamento à fila
    load() {
        this._queue.push('_load')
    }

    // Adiciona o salvamento à fila
    save() {
        this._queue.push('_save')
    }

    // Função interna que lê o arquivo JSON do disco
    _load() {
        try {
          return this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {}
        } catch (e) {
          this.logger.error('Erro ao carregar o banco de dados:', e)
          return this._data = {}
        }
    }

    // Função interna que escreve os dados no disco de forma assíncrona
    async _save() {
        let dirname = _dirname(this.file)
        if (!existsSync(dirname)) await fs.mkdir(dirname, { recursive: true })
        await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs))
        return this.file
    }
}

export default Database