import { INVALID_MOVE } from 'boardgame.io/core';
import { CellCount, MaxMisThrows, RowCount, RED, YELLOW, GREEN, BLUE } from './Constants';

export const Qwixx = {

    setup: prepareGame,

    turn: {
        stages: {
            throwDice: {
                moves: { ThrowDice }
            }
        }
    },

    endIf: (G, ctx) => {
        if (G.player1.misThrowCount === MaxMisThrows) {
            ctx.events.endGame();
        }
    }
}

function ThrowDice() {
    
}

function prepareGame() {

    return {
        player1: {
            selected: Array(RowCount).fill(null).map(() => Array(CellCount).fill(null)),
            misThrowCount: 0
        },
        board: createDefaultBoard()
    }

}

function createDefaultBoard() {
    return [
        [   // Row0 = all red
            { number: 2, color: RED }, { number: 3, color: RED }, { number: 4, color: RED }, { number: 5, color: RED }, { number: 6, color: RED }, { number: 7, color: RED }, 
            { number: 8, color: RED }, { number: 9, color: RED },{ number: 10, color: RED }, { number: 11, color: RED }, { number: 12, color: RED }
        ],
        [   // Row0 = all yellow
            { number: 2, color: YELLOW }, { number: 3, color: YELLOW }, { number: 4, color: YELLOW }, { number: 5, color: YELLOW }, { number: 6, color: YELLOW }, { number: 7, color: YELLOW }, 
            { number: 8, color: YELLOW }, { number: 9, color: YELLOW },{ number: 10, color: YELLOW }, { number: 11, color: YELLOW }, { number: 12, color: YELLOW }
        ],
        [   // Row0 = all green
            { number: 12, color: GREEN }, { number: 11, color: GREEN }, { number: 10, color: GREEN }, { number: 9, color: GREEN }, { number: 8, color: GREEN }, { number: 7, color: GREEN }, 
            { number: 6, color: GREEN }, { number: 5, color: GREEN },{ number: 4, color: GREEN }, { number: 3, color: GREEN }, { number: 2, color: GREEN }
        ],
        [   // Row0 = all blue
            { number: 12, color: BLUE }, { number: 11, color: BLUE }, { number: 10, color: BLUE }, { number: 9, color: BLUE }, { number: 8, color: BLUE }, { number: 7, color: BLUE }, 
            { number: 6, color: BLUE }, { number: 5, color: BLUE },{ number: 4, color: BLUE }, { number: 3, color: BLUE }, { number: 2, color: BLUE }
        ],
    ];
}