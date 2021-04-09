import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { ColCount, NOTSELETED, RowCount, SELECTED, UNSELETED } from './Constants';
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
      for (let j = 0; j < ColCount; j++) {
        const color = board[i][j].color,
          number = board[i][j].number;
        cells.push(`<td class="cell ${color}" data-row="${i}" data-col="${j}">${number}</td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <h3>Player ${this.client.playerID}</h3>
      <table>${rows.join('')}</table>
      <table><tr>
        <td class="die white1"></td>
        <td class="die white2"></td>

        <td class="die red"></td>
        <td class="die yellow"></td>
        <td class="die green"></td>
        <td class="die blue"></td>
      </tr></table>
      <p class="message"></p>
      <button class="throw-dice">Throw dice</button>
      <button class="discard">Discard</button>
      <button class="mis-throw">Mis throw :(</button>
      <span>Missed throws: <span class="missed">0</span> (max: 4)</span>
    `;
  }

  attachListeners() {
    
    const handleCellClick = event => {
      const row = parseInt(event.target.dataset.row);
      const col = parseInt(event.target.dataset.col);
      this.client.moves.PickDice(row, col);
    };

    const handleThrowClick = event => {
      this.client.moves.ThrowDice();
    };

    const handleDiscardClick = event => {
      this.client.moves.Discard();
    };

    const handleMisClick = event => {
      this.client.moves.MisThrow();
    }

    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });
    
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
    const player = state.G['player' + this.client.playerID];

    this.drawDice(state.G);
    this.drawSelected(player.selected);

    const playerStage = state.ctx.activePlayers && state.ctx.activePlayers[this.client.playerID];

    const throwButton = this.rootElement.querySelector('.throw-dice');
    const discardButton = this.rootElement.querySelector('.discard');    
    const misButton = this.rootElement.querySelector('.mis-throw');
    const missedEl = this.rootElement.querySelector('.missed');
    const messageEl = this.rootElement.querySelector('.message');

    const canDiscard = playerStage === 'pickingWhite' || (playerStage === 'pickingColor' && !state.G.currentPlayerDiscardedWhite);
    const canThrow = playerStage === 'rolling';
    const canMis = isCurrentPlayer && playerStage === 'pickingColor' && state.G.currentPlayerDiscardedWhite;

    throwButton.disabled = !canThrow;
    discardButton.disabled = !canDiscard;
    misButton.disabled = !canMis;
    missedEl.textContent = player.misThrowCount;
    messageEl.textContent = `It’s player ${state.ctx.currentPlayer}’s turn. --> ${playerStage}`;
  }

  drawDice(G) {
    this.rootElement.querySelector('.die.white1').textContent = G.whiteDice1;
    this.rootElement.querySelector('.die.white2').textContent = G.whiteDice2;
    this.rootElement.querySelector('.die.red').textContent = G.redDice;
    this.rootElement.querySelector('.die.yellow').textContent = G.yellowDice;
    this.rootElement.querySelector('.die.green').textContent = G.greenDice;
    this.rootElement.querySelector('.die.blue').textContent = G.blueDice;
  }

  drawSelected(selected) {
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      if (selected[row][col] === SELECTED) {
        cell.classList.add('selected');
      } else if (selected[row][col] === NOTSELETED) {
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