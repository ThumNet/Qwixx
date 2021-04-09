import { INVALID_MOVE } from 'boardgame.io/core';
import { CellCount, MaxMisThrows, RowCount, RED, YELLOW, GREEN, BLUE, WHITE } from './Constants';

export const Qwixx = {

    setup: prepareGame,


    turn: {

        onBegin: (G, ctx) => {
            console.log('onbegin', ctx.currentPlayer);
            G.player0.movesLeft = 1;
            G.player1.movesLeft = 1;
            G['player'+ctx.currentPlayer].movesLeft = 2;
            //G.player0.waiting = false;
            //G.player1.waiting = false;
            ctx.events.setActivePlayers({ currentPlayer: 'rolling' });
        },
        //activePlayers: { currentPlayer: 'rolling' },

        endIf: (G, ctx) => {
            console.log('turn.endIf', G, ctx.activePlayers);
            return G.player0.movesLeft <= 0 && G.player1.movesLeft <= 0;
        },

        stages: {
            rolling: {
                moves: { ThrowDice },
            },

            pickingWhite: {
                moves: { PickDice, MisThrow, Discard },
            },

            pickingColor: {
                moves: { PickDice, Discard },
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
    const isCurrentPlayer = ctx.currentPlayer === ctx.playerID;
    const player = G['player' + ctx.playerID];

    console.log('Discard', isCurrentPlayer, ctx);

    if (!isCurrentPlayer) {

    }
    player.movesLeft--;
    ctx.events.endStage();
}


function ThrowDice(G, ctx) {
    console.log('throwdice')
    G.redDice = ctx.random.D6();
    G.yellowDice = ctx.random.D6();
    G.greenDice = ctx.random.D6();
    G.blueDice = ctx.random.D6();
    G.whiteDice1 = ctx.random.D6();
    G.whiteDice2 = ctx.random.D6();

    ctx.events.setActivePlayers({
        all: 'pickingWhite'
    });
}

function PickDice(G, ctx, row, coll) {
    const isCurrentPlayer = ctx.currentPlayer === ctx.playerID;
    const cell = G.board[row][coll];
    const player = G['player' + ctx.playerID];

    if (player.selected[row][coll] !== null) {
        return INVALID_MOVE;
    }

    const stage = ctx.activePlayers[ctx.playerID];

    console.log('PickDice', row, coll, ctx.playerID, ctx.activePlayers[ctx.playerID]);

    const sumWhite = G.whiteDice1 + G.whiteDice2;

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

        disableLeft(player.selected, row, coll);
        player.selected[row][coll] = true;
        player.movesLeft--;

        if (stage === 'pickingWhite') {
            ctx.events.setStage('pickingColor');
        }
        else { ctx.events.endStage(); }
    }
    else {
        if (cell.number !== sumWhite) {
            return INVALID_MOVE;
        }

        disableLeft(player.selected, row, coll);
        player.selected[row][coll] = true;
        player.movesLeft--;
        ctx.events.endStage();
    }
}

function MisThrow(G, ctx) {
    console.log('MisThrow', ctx);

    const player = G['player' + ctx.playerID];
    player.misThrowCount++;
    player.movesLeft = 0;
}

function prepareGame() {

    return {
        player0: {
            selected: Array(RowCount).fill(null).map(() => Array(CellCount).fill(null)),
            misThrowCount: 0,
            movesLeft: 2,
        },
        player1: {
            selected: Array(RowCount).fill(null).map(() => Array(CellCount).fill(null)),
            misThrowCount: 0,
            movesLeft: 1,
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