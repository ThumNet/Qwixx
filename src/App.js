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
        cells.push(`<td class="cell ${color}" data-row="${i}" data-coll="${j}">${number}</td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <h3>Player ${this.client.playerID}</h3>
      <table>${rows.join('')}</table>
      <table><tr>
        <td class="die red"></td>
        <td class="die yellow"></td>
        <td class="die green"></td>
        <td class="die blue"></td>
        <td class="die white1"></td>
        <td class="die white2"></td>
      </tr></table>
      <p class="winner"></p>
      <button class="throw-dice">Throw dice</button>
      <button class="discard">Discard</button>
      <button class="mis-throw">Mis throw :(</button>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const row = parseInt(event.target.dataset.row);
      const coll = parseInt(event.target.dataset.coll);
      this.client.moves.PickDice(row, coll);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });
    const handleThrowClick = event => {
      this.client.moves.ThrowDice();
    };

    const handleDiscardClick = event => {
      this.client.moves.Discard();
    };

    const handleMisClick = event => {
      this.client.moves.MisThrow();
    }

    const throwButton = this.rootElement.querySelector('.throw-dice');
    throwButton.onclick = handleThrowClick;

    const discardButton = this.rootElement.querySelector('.discard');
    discardButton.onclick = handleDiscardClick;

    const misButton = this.rootElement.querySelector('.mis-throw');
    misButton.onclick = handleMisClick;
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
    const isCurrentPlayer = state.ctx.currentPlayer === this.client.playerID;

    this.drawDice(state.G);
    this.drawSelected(state.G['player' + this.client.playerID].selected);



    const playerStage = state.ctx.activePlayers && state.ctx.activePlayers[this.client.playerID];

    const throwButton = this.rootElement.querySelector('.throw-dice');
    const discardButton = this.rootElement.querySelector('.discard');    
    const misButton = this.rootElement.querySelector('.mis-throw');


    throwButton.disabled = !(playerStage === 'rolling');
    discardButton.disabled = !playerStage || (playerStage === 'rolling');
    misButton.disabled = !playerStage || !(isCurrentPlayer && playerStage === 'pickingWhite');

    const messageEl = this.rootElement.querySelector('.winner');
    messageEl.textContent = `It’s player ${state.ctx.currentPlayer}’s turn. ${this.client.playerID} -> ${playerStage}`;
  }

  drawDice(G) {
    if (G.whiteDice1) {
      this.rootElement.querySelector('.die.red').textContent = G.redDice;
      this.rootElement.querySelector('.die.yellow').textContent = G.yellowDice;
      this.rootElement.querySelector('.die.green').textContent = G.greenDice;
      this.rootElement.querySelector('.die.blue').textContent = G.blueDice;
      this.rootElement.querySelector('.die.white1').textContent = G.whiteDice1;
      this.rootElement.querySelector('.die.white2').textContent = G.whiteDice2;
    }
  }

  drawSelected(selected) {
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const coll = parseInt(cell.dataset.coll);
      if (selected[row][coll] === true) {
        cell.classList.add('selected');
      } else if (selected[row][coll] === false) {
        cell.classList.add('not-selected');
      }
    });
  }
}



const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new QwixxClient(rootElement, { playerID });
});