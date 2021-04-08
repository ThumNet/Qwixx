import { INVALID_MOVE } from 'boardgame.io/core';
import { CellCount, MaxMisThrows, RowCount, RED, YELLOW, GREEN, BLUE, WHITE } from './Constants';

export const Qwixx = {

    setup: prepareGame,


    turn: {
        activePlayers: { currentPlayer: 'throwDice' },

        endIf: (G, ctx) => {
            console.log('turn.endIf', ctx.activePlayers);
            return ctx.activePlayers === null;
        },

        stages: {
            throwDice: {
                moves: { ThrowDice },
                next: 'playerPickWhite'
            },

            playerPickWhite: {
                moves: { PickDice, MisThrow, Discard },
                next: 'playerPickColor',
                onEnd: (G,ctx) => {
                    console.log('playerPickWhite.onEnd', ctx.activePlayers);
                }
            },

            playerPickColor: {
                moves: { PickDice, Discard },
            },

            othersPickWhite: {
                moves: { PickDice, Discard }
            }
        }
    },

    endIf: (G, ctx) => {
        if (G.player1.misThrowCount === MaxMisThrows) {
            ctx.events.endGame();
        }
    }
}

function Discard(G, ctx) {
    console.log('Discard', ctx);
    ctx.events.endStage();
}


function ThrowDice(G, ctx) {
    G.redDice = ctx.random.D6();
    G.yellowDice = ctx.random.D6();
    G.greenDice = ctx.random.D6();
    G.blueDice = ctx.random.D6();
    G.whiteDice1 = ctx.random.D6();
    G.whiteDice2 = ctx.random.D6();

    ctx.events.setActivePlayers({
        others: { stage: 'othersPickWhite' },
        currentPlayer: { stage: 'playerPickWhite' }
    });
}

function PickDice(G, ctx, row, coll) {
    const isCurrentPlayer = ctx.currentPlayer === ctx.playerID;
    const cell = G.board[row][coll];
    const playerSelected = G['player' + ctx.playerID].selected;

    if (playerSelected[row][coll] !== null) {
        return INVALID_MOVE;
    }

    const sumWhite = G.whiteDice1 + G.whiteDice2;
    console.log(sumWhite);

    const disableLeft = (playerSelected, row, coll) => {
        for (var i = 0; i < coll; i++) {
            if (playerSelected[row][i] === null) playerSelected[row][i] = false;
        }
    };

    const isValidPlayerSelection = (cell, G) => {
        const isWhiteSum = cell.number === G.whiteDice1 + G.whiteDice2;
        const isRed1Sum = cell.color === RED && cell.number === G.redDice + G.whiteDice1;
        const isRed2Sum = cell.color === RED && cell.number === G.redDice + G.whiteDice2;
        const isYellow1Sum = cell.color === YELLOW && cell.number === G.yellowDice + G.whiteDice1;
        const isYellow2Sum = cell.color === YELLOW && cell.number === G.yellowDice + G.whiteDice2;
        const isGreen1Sum = cell.color === GREEN && cell.number === G.greenDice + G.whiteDice1;
        const isGreen2Sum = cell.color === GREEN && cell.number === G.greenDice + G.whiteDice2;
        const isBlue1Sum = cell.color === BLUE && cell.number === G.blueDice + G.whiteDice1;
        const isBlue2Sum = cell.color === BLUE && cell.number === G.blueDice + G.whiteDice2;
        return isWhiteSum || isRed1Sum || isRed2Sum || isYellow1Sum || isYellow2Sum
            || isGreen1Sum || isGreen2Sum || isBlue1Sum || isBlue2Sum;
    };

    if (isCurrentPlayer) {
        if (!isValidPlayerSelection(cell, G)) {
            return INVALID_MOVE;
        }

        disableLeft(playerSelected, row, coll);
        playerSelected[row][coll] = true;
        ctx.events.endStage();
    }
    else {
        if (cell.number !== sumWhite) {
            return INVALID_MOVE;
        }

        disableLeft(playerSelected, row, coll);
        playerSelected[row][coll] = true;
        ctx.events.endStage();
    }
}

function MisThrow(G, ctx) {
    console.log('MisThrow', ctx);

    const player = G['player' + ctx.playerID];
    player.misThrowCount++;
    //todo: ctx.events.setStage(undefined);
}

function prepareGame() {

    return {
        player0: {
            selected: Array(RowCount).fill(null).map(() => Array(CellCount).fill(null)),
            misThrowCount: 0
        },
        player1: {
            selected: Array(RowCount).fill(null).map(() => Array(CellCount).fill(null)),
            misThrowCount: 0
        },
        redDice: null,
        yellowDice: null,
        greenDice: null,
        blueDice: null,
        whiteDice1: null,
        whiteDice2: null,
        board: createDefaultBoard()
    }

}

function createDefaultBoard() {
    return [
        [   // Row0 = all red
            { number: 2, color: RED }, { number: 3, color: RED }, { number: 4, color: RED }, { number: 5, color: RED }, { number: 6, color: RED }, { number: 7, color: RED },
            { number: 8, color: RED }, { number: 9, color: RED }, { number: 10, color: RED }, { number: 11, color: RED }, { number: 12, color: RED }
        ],
        [   // Row0 = all yellow
            { number: 2, color: YELLOW }, { number: 3, color: YELLOW }, { number: 4, color: YELLOW }, { number: 5, color: YELLOW }, { number: 6, color: YELLOW }, { number: 7, color: YELLOW },
            { number: 8, color: YELLOW }, { number: 9, color: YELLOW }, { number: 10, color: YELLOW }, { number: 11, color: YELLOW }, { number: 12, color: YELLOW }
        ],
        [   // Row0 = all green
            { number: 12, color: GREEN }, { number: 11, color: GREEN }, { number: 10, color: GREEN }, { number: 9, color: GREEN }, { number: 8, color: GREEN }, { number: 7, color: GREEN },
            { number: 6, color: GREEN }, { number: 5, color: GREEN }, { number: 4, color: GREEN }, { number: 3, color: GREEN }, { number: 2, color: GREEN }
        ],
        [   // Row0 = all blue
            { number: 12, color: BLUE }, { number: 11, color: BLUE }, { number: 10, color: BLUE }, { number: 9, color: BLUE }, { number: 8, color: BLUE }, { number: 7, color: BLUE },
            { number: 6, color: BLUE }, { number: 5, color: BLUE }, { number: 4, color: BLUE }, { number: 3, color: BLUE }, { number: 2, color: BLUE }
        ],
    ];
}