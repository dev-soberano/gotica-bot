/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX
        this.playerO = playerO
        this._currentTurn = false
        this._x = 0
        this._o = 0
        this.turns = 0
    }

    get board() {
        return this._x | this._o
    }

    get currentTurn() {
        return this._currentTurn ? this.playerO : this.playerX
    }

    get enemyTurn() {
        return this._currentTurn ? this.playerX : this.playerO
    }

    /**
     * Verifica se há um vencedor comparando o estado com as combinações de vitória
     */
    static check(state) {
        // [7, 56, 73, 84, 146, 273, 292, 448] são as máscaras binárias das vitórias
        for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
            if ((state & combo) === combo)
                return !0
        return !1
    }

    /**
     * Converte coordenadas x, y para posição binária
     */
    static toBinary(x = 0, y = 0) {
        if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error('Posição Inválida')
        return 1 << x + (3 * y)
    }

    /**
     * Realiza uma jogada na rodada atual
     * @returns {-3|-2|-1|0|1} Status da jogada
     */
    turn(player = 0, x = 0, y) {
        if (this.board === 511) return -3 // Jogo Empatado/Finalizado
        let pos = 0
        if (y == null) {
            if (x < 0 || x > 8) return -1 // Posição fora do limite
            pos = 1 << x
        } else {
            if (x < 0 || x > 2 || y < 0 || y > 2) return -1
            pos = TicTacToe.toBinary(x, y)
        }
        
        if (this._currentTurn ^ player) return -2 // Não é a vez deste jogador
        if (this.board & pos) return 0 // Posição já ocupada
        
        this[this._currentTurn ? '_o' : '_x'] |= pos
        this._currentTurn = !this._currentTurn
        this.turns++
        return 1 // Sucesso
    }

    /**
     * Transforma os dados binários em um array visual para o chat
     */
    static render(boardX = 0, boardO = 0) {
        let x = parseInt(boardX.toString(2), 4)
        let y = parseInt(boardO.toString(2), 4) * 2
        return [...(x + y).toString(4).padStart(9, '0')].reverse().map((value, index) => value == 1 ? 'X' : value == 2 ? 'O' : ++index)
    }
    
    render() {
        return TicTacToe.render(this._x, this._o)
    }

    /**
     * Retorna o vencedor se houver um
     */
    get winner() {
        let x = TicTacToe.check(this._x)
        let o = TicTacToe.check(this._o)
        return x ? this.playerX : o ? this.playerO : false
    }
}

export default TicTacToe