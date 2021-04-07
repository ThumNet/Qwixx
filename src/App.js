import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { CellCount, RowCount } from './Constants';
import { Qwixx } from './Game';

class QwixxClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({ 
      game: Qwixx,
      multiplayer: Local(),
      playerID
    });

    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners();

    // As before, but we also subscribe to the client:
    this.client.subscribe(state => this.update(state));
  }

  createBoard() {
    // Create cells in rows for the Tic-Tac-Toe board.
    const board = this.client.getInitialState().G.board;
    const rows = [];
    for (let i = 0; i < RowCount; i++) {
        const cells = [];
        for (let j = 0; j < CellCount; j++) {
            const color = board[i][j].color,
              number = board[i][j].number;
            cells.push(`<td class="cell ${color}" data-number="${number}" data-color="${color}">${number}</td>`);
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <h3>Player ${this.client.playerID}</h3>
      <table>${rows.join('')}</table>
      <p class="winner"></p>
      <button class="throw-dice">Throw dice</button>
    `;
  }

  attachListeners() {
    // // This event handler will read the cell id from a cell’s
    // // `data-id` attribute and make the `clickCell` move.
    // const handleCellClick = event => {
    //     const id = parseInt(event.target.dataset.id);
    //     this.client.moves.clickCell(id);
    // };
    // // Attach the event listener to each of the board cells.
    // const cells = this.rootElement.querySelectorAll('.cell');
    // cells.forEach(cell => {
    //     cell.onclick = handleCellClick;
    // });
    const handleThrowClick = event => {
        this.client.moves.throwDice();
    };

    const throwButton = this.rootElement.querySelector('.throw-dice');
    throwButton.onclick = handleThrowClick;

  }

  update(state) {
    // // Get all the board cells.
    // const cells = this.rootElement.querySelectorAll('.cell');
    // // Update cells to display the values in game state.
    // cells.forEach(cell => {
    //   const cellId = parseInt(cell.dataset.id);
    //   const cellValue = state.G.cells[cellId];
    //   cell.textContent = cellValue !== null ? cellValue : '';
    // });
    // // Get the gameover message element.
    // const messageEl = this.rootElement.querySelector('.winner');
    // // Update the element to show a winner if any.
    // if (state.ctx.gameover) {
    //   messageEl.textContent =
    //     state.ctx.gameover.winner !== undefined
    //       ? 'Winner: ' + state.ctx.gameover.winner
    //       : 'Draw!';
    // } else {
    //   messageEl.textContent = '';
    // }
    const messageEl = this.rootElement.querySelector('.winner');
    messageEl.textContent = `It’s player ${state.ctx.currentPlayer}’s turn`;
  }
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new QwixxClient(rootElement, { playerID });
});