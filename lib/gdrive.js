/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

import { join } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { google } from 'googleapis'
import { EventEmitter } from 'events'

// Escopos de permissão: Apenas leitura de metadados (ajustável conforme necessidade)
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

// Caminho onde o token de acesso será salvo
const TOKEN_PATH = join(global.__dirname(import.meta.url), '..', 'token.json')

class GoogleAuth extends EventEmitter {
  constructor() {
    super()
  }

  /**
   * Realiza a autorização com as credenciais do Google
   * @param {Object} credentials 
   */
  async authorize(credentials) {
    let token
    const { client_secret, client_id } = credentials
    const port = 3000 // Porta padrão para o callback
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${port}`)
    
    try {
      // Tenta ler o token já existente
      token = JSON.parse(await fs.readFile(TOKEN_PATH))
    } catch (e) {
      // Se não existir, gera uma URL de autenticação
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      this.emit('auth', authUrl)
      
      // Aguarda o código ser enviado via comando ou evento
      let code = await promisify(this.once).bind(this)('token')
      token = await oAuth2Client.getToken(code)
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
    } finally {
      await oAuth2Client.setCredentials(token)
    }
  }

  token(code) {
    this.emit('token', code)
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super()
    this.path = '/drive/api'
  }

  // Métodos para serem implementados conforme a necessidade do bot:
  async getFolderID(path) {
    // Busca o ID de uma pasta específica
  }

  async infoFile(path) {
    // Obtém informações de um arquivo
  }

  async folderList(path) {
    // Lista o conteúdo de uma pasta
  }

  async downloadFile(path) {
    // Baixa um arquivo do Drive
  }

  async uploadFile(path) {
    // Envia um arquivo para o Drive
  }
}

export { GoogleAuth, GoogleDrive }