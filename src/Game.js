import { INVALID_MOVE } from 'boardgame.io/core';
import { ColCount, MaxMisThrows, RowCount, RED, YELLOW, 
    GREEN, BLUE, WHITE, SELECTED, NOTSELETED, UNSELETED } from './Constants';

// TODO:
// - test row disable + dice removal
// - Calculate score
// - Display winner
// - Improve styling :)

export const Qwixx = {

    setup: prepareGame,

    turn: {

        onBegin: (G, ctx) => {
            console.log('onbegin', ctx.currentPlayer);
            resetTurn(G, ctx);
        },

        endIf: (G, ctx) => {
            console.log('turn.endIf', G, ctx.activePlayers);
            return G.player0.movesLeft <= 0 && G.player1.movesLeft <= 0;
        },

        stages: {
            rolling: {
                moves: { ThrowDice },
            },

            pickingWhite: {
                moves: { PickDice, Discard },
            },

            pickingColor: {
                moves: { PickDice, Discard, MisThrow },
            }

        }
    },

    endIf: (G, ctx) => {
        if (hasGameEnded(G)) {
            // TODO calculate score
            ctx.events.endGame();
        }
    }
}

function resetTurn(G, ctx) {
    G.redDice = null;
    G.yellowDice = null;
    G.greenDice = null;
    G.blueDice = null;
    G.whiteDice1 = null;
    G.whiteDice2 = null;
    
    G.player0.movesLeft = 1;
    G.player1.movesLeft = 1;
    G['player' + ctx.currentPlayer].movesLeft = 2;

    G.currentPlayerDiscardedWhite = false;

    ctx.events.setActivePlayers({ currentPlayer: 'rolling' });
}

function hasGameEnded(G) {
    const hasMaxMissesP0 = G.player0.misThrowCount === MaxMisThrows;
    const hasMaxMissesP1 = G.player1.misThrowCount === MaxMisThrows;
    const hasMaxRowsClosed = G.closedRows.filter(x => x === true).length >= 2;
    return hasMaxMissesP0 || hasMaxMissesP1 || hasMaxRowsClosed;
}

function Discard(G, ctx) {
    const isCurrentPlayer = ctx.currentPlayer === ctx.playerID;
    const player = G['player' + ctx.playerID];
    const stage = ctx.activePlayers[ctx.playerID];

    console.log('Discard', isCurrentPlayer, ctx);

    player.movesLeft--;

    if (isCurrentPlayer && stage === 'pickingWhite') {
        G.currentPlayerDiscardedWhite = true;
        ctx.events.setStage('pickingColor');
    } else {
        ctx.events.endStage();
    }
}


function ThrowDice(G, ctx) {
    console.log('throwdice');

    if (!G.closedRows[0]) { G.redDice = ctx.random.D6(); }
    if (!G.closedRows[1]) { G.yellowDice = ctx.random.D6(); }
    if (!G.closedRows[2]) { G.greenDice = ctx.random.D6(); }
    if (!G.closedRows[3]) { G.blueDice = ctx.random.D6(); }

    G.whiteDice1 = ctx.random.D6();
    G.whiteDice2 = ctx.random.D6();

    ctx.events.setActivePlayers({
        all: 'pickingWhite'
    });
}

function PickDice(G, ctx, row, col) {
    const isCurrentPlayer = ctx.currentPlayer === ctx.playerID;
    const cell = G.board[row][col];
    const player = G['player' + ctx.playerID];
    const stage = ctx.activePlayers[ctx.playerID];

    console.log('PickDice', row, col, ctx.playerID, stage);

    if (player.selected[row][col] !== UNSELETED) {
        return INVALID_MOVE;
    }

    const isValidWhiteSelection = (cell, G) => {
        const sumWhite = G.whiteDice1 + G.whiteDice2;
        return cell.number === sumWhite;
    }

    const isLastCol = (col) => col === ColCount - 1;

    const has5Selected = (playerRow) => {
        return playerRow.filter(s => s === SELECTED).length >= 5;
    }

    const isValidColorSelection = (cell, G) => {
        const isRed1Sum = cell.color === RED && cell.number === G.redDice + G.whiteDice1;
        const isRed2Sum = cell.color === RED && cell.number === G.redDice + G.whiteDice2;
        const isYellow1Sum = cell.color === YELLOW && cell.number === G.yellowDice + G.whiteDice1;
        const isYellow2Sum = cell.color === YELLOW && cell.number === G.yellowDice + G.whiteDice2;
        const isGreen1Sum = cell.color === GREEN && cell.number === G.greenDice + G.whiteDice1;
        const isGreen2Sum = cell.color === GREEN && cell.number === G.greenDice + G.whiteDice2;
        const isBlue1Sum = cell.color === BLUE && cell.number === G.blueDice + G.whiteDice1;
        const isBlue2Sum = cell.color === BLUE && cell.number === G.blueDice + G.whiteDice2;
        return isRed1Sum || isRed2Sum || isYellow1Sum || isYellow2Sum
            || isGreen1Sum || isGreen2Sum || isBlue1Sum || isBlue2Sum;
    };

    const selectCell = (player, row, col, G) => {
        const playerRow = player.selected[row];
        // disable the cell left to the col
        for (var i = 0; i < col; i++) {
            if (playerRow[i] === UNSELETED) playerRow[i] = NOTSELETED;
        }
        playerRow[col] = SELECTED;
        if (isLastCol(col)){ G.closedRows[row] = true; }
        player.movesLeft--;
    };

    if (stage === 'pickingWhite') {
        if (!isValidWhiteSelection(cell, G)) {
            return INVALID_MOVE;
        }
        if (isLastCol(col) && !has5Selected(player.selected[row])){ 
            return INVALID_MOVE;
        }

        selectCell(player, row, col, G);
        if (isCurrentPlayer) { ctx.events.setStage('pickingColor'); }
        else { ctx.events.endStage(); }
    }

    if (stage === 'pickingColor') {
        if (!isValidColorSelection(cell, G)) {
            return INVALID_MOVE;
        }
        if (isLastCol(col) && !has5Selected(player.selected[row])){ 
            return INVALID_MOVE;
        }

        selectCell(player, row, col, G);
        ctx.events.endStage();
    }
}

function MisThrow(G, ctx) {
    console.log('MisThrow', ctx);

    const player = G['player' + ctx.playerID];
    player.misThrowCount++;
    player.movesLeft = 0;
    ctx.events.endStage();
}

function prepareGame() {

    return {
        player0: {
            selected: Array(RowCount).fill(null).map(() => Array(ColCount).fill(UNSELETED)),
            misThrowCount: 0,
            movesLeft: 2,
        },
        player1: {
            selected: Array(RowCount).fill(null).map(() => Array(ColCount).fill(UNSELETED)),
            misThrowCount: 0,
            movesLeft: 1,
        },
        currentPlayerDiscardedWhite: false,        
        redDice: null,
        yellowDice: null,
        greenDice: null,
        blueDice: null,
        whiteDice1: null,
        whiteDice2: null,
        closedRows: Array(RowCount).fill(false),
        board: createDefaultBoard()
    }

}

function createDefaultBoard() {
    return [
        [   // Row0 = all red
            { number: 2, color: RED }, { number: 3, color: RED }, { number: 4, color: RED }, { number: 5, color: RED }, 
            { number: 6, color: RED }, { number: 7, color: RED }, { number: 8, color: RED }, { number: 9, color: RED }, 
            { number: 10, color: RED }, { number: 11, color: RED }, { number: 12, color: RED }
        ],
        [   // Row0 = all yellow
            { number: 2, color: YELLOW }, { number: 3, color: YELLOW }, { number: 4, color: YELLOW }, { number: 5, color: YELLOW }, 
            { number: 6, color: YELLOW }, { number: 7, color: YELLOW }, { number: 8, color: YELLOW }, { number: 9, color: YELLOW }, 
            { number: 10, color: YELLOW }, { number: 11, color: YELLOW }, { number: 12, color: YELLOW }
        ],
        [   // Row0 = all green
            { number: 12, color: GREEN }, { number: 11, color: GREEN }, { number: 10, color: GREEN }, { number: 9, color: GREEN }, 
            { number: 8, color: GREEN }, { number: 7, color: GREEN }, { number: 6, color: GREEN }, { number: 5, color: GREEN }, 
            { number: 4, color: GREEN }, { number: 3, color: GREEN }, { number: 2, color: GREEN }
        ],
        [   // Row0 = all blue
            { number: 12, color: BLUE }, { number: 11, color: BLUE }, { number: 10, color: BLUE }, { number: 9, color: BLUE }, 
            { number: 8, color: BLUE }, { number: 7, color: BLUE }, { number: 6, color: BLUE }, { number: 5, color: BLUE },
            { number: 4, color: BLUE }, { number: 3, color: BLUE }, { number: 2, color: BLUE }
        ],
    ];
}