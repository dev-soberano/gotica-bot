/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

export declare class TicTacToe {
    /* Nome do Jogador X */
    playerX: string;
    /* Nome do Jogador Y */
    playerY: string;
    /* Verdadeiro se for a vez do X, Falso se for o Y */
    _currentTurn: boolean;
    _x: number;
    _y: number;
    _turns: number;
    
    constructor(playerX: string, playerY: string);
    
    /** Retorna o estado atual do tabuleiro */
    get board(): number;

    /** * Realiza uma jogada 
     * @param player O jogador atual
     * @param index A posição no tabuleiro (0-8)
     */
    turn(player: any, index: number): boolean;

    /**
     * Realiza uma jogada usando coordenadas
     */
    turn(player: any, x: number, y: number): boolean;
}