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
        const classNameExtra = j === 0 ? 'first' : j === ColCount - 1 ? 'last' : '';
        cells.push(`
        <td class="cell ${color} ${classNameExtra}">
          <span><i data-row="${i}" data-col="${j}">${number}</i></span>
        </td>`);
      }
      rows.push(`<tr>
          <td class="space">&nbsp;</td>
          ${cells.join('')}
          <td class="lock ${board[i][ColCount-1].color}"><span>&nbsp;</span></td>
          <td class="space">&nbsp;</td>
        </tr>`
      );
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <h3>Player ${this.client.playerID}</h3>
      <table class="noborder">
        ${rows.join('')}
        <tr>
          <td class="space">&nbsp;</td>
          <td class="fail" colspan="${ColCount+1}">
            <span class="fail-text">Misthrows:</span>
            <span class="fail-box">&nbsp;</span>
            <span class="fail-box">&nbsp;</span>
            <span class="fail-box">&nbsp;</span>
            <span class="fail-box">&nbsp;</span>
          </td>
          <td class="space">&nbsp;</td>
        </tr>
        <tr>
          <td class="score space">&nbsp;</td>
          <td class="score score-text">Score:</td>
          <td class="score score-calc" colspan="${ColCount}">
            <span class="score-box red"></span>
            <i>+</i>
            <span class="score-box yellow"></span>
            <i>+</i>
            <span class="score-box green"></span>
            <i>+</i>
            <span class="score-box blue"></span>
            <i>-</i>
            <span class="score-box minus"></span>
            <i>=</i>
            <span class="score-box total"></span>
          </td>
          <td class="score space">&nbsp;</td>
        </tr>
      </table>
      <div class="dice">
        ${this.createDie(true, 'die-white1')}
        ${this.createDie(false, 'die-white2')}
        ${this.createDie(true, 'die-red')}
        ${this.createDie(false, 'die-yellow')}
        ${this.createDie(true, 'die-green')}
        ${this.createDie(false, 'die-blue')}
      </div>
      <p class="message"></p>
      <button class="throw-dice">Throw dice</button>
      <button class="discard">Discard</button>
      <button class="mis-throw">Mis throw :(</button>
    `;
  }

  createDie(odd, dieName){
    const rollClass = odd ? 'odd-roll' : 'even-roll'
    return `<ol class="die-list ${rollClass} ${dieName}" data-roll="">
        <li class="die-item" data-side="1">
        <span class="dot"></span>
      </li>
      <li class="die-item" data-side="2">
        <span class="dot"></span>
        <span class="dot"></span>
      </li>
      <li class="die-item" data-side="3">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </li>
      <li class="die-item" data-side="4">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </li>
      <li class="die-item" data-side="5">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </li>
      <li class="die-item" data-side="6">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </li>
    </ol>`;
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
    const cells = this.rootElement.querySelectorAll('.cell span i');
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
    const isCurrentPlayer = state.ctx.currentPlayer === this.client.playerID;
    const player = state.G['player' + this.client.playerID];
    const playerStage = state.ctx.activePlayers && state.ctx.activePlayers[this.client.playerID];

    this.drawDice(state.G, playerStage);
    this.drawSelected(player.selected);
    this.drawScore(player.score);
    this.drawButtons(isCurrentPlayer, playerStage, state.G.currentPlayerDiscardedWhite);
    this.drawMissed(player.misThrowCount);
    this.drawMessage(state.ctx, playerStage);
  }

  drawDice(G, playerStage) {

    if (playerStage === 'pickingDice') { // only animate once per throw
      const dice = [...this.rootElement.querySelectorAll(".die-list")];
      dice.forEach(die => {
        die.classList.toggle("odd-roll");
        die.classList.toggle("even-roll");
      });
    }

    this.rootElement.querySelector('.die-white1').dataset.roll = G.whiteDice1;
    this.rootElement.querySelector('.die-white2').dataset.roll = G.whiteDice2;
    this.rootElement.querySelector('.die-red').dataset.roll = G.redDice;
    this.rootElement.querySelector('.die-yellow').dataset.roll = G.yellowDice;
    this.rootElement.querySelector('.die-green').dataset.roll = G.greenDice;
    this.rootElement.querySelector('.die-blue').dataset.roll = G.blueDice;

    if (!G.whiteDice1) { // swap animation
      const dice = [...this.rootElement.querySelectorAll(".die-list")];
      dice.forEach(die => {
        die.classList.remove("odd-roll");
        die.classList.remove("even-roll");
        const isEven = Math.floor(Math.random() * 2) === 1;
        die.classList.add(isEven ? "even-roll" : 'odd-roll');
      });
    }
  }

  drawSelected(selected) {
    const cells = this.rootElement.querySelectorAll('.cell span i');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      if (selected[row][col] === SELECTED) {
        cell.parentNode.classList.add('selected');
      } else if (selected[row][col] === NOTSELETED) {
        cell.parentNode.classList.add('not-selected');
      }
    });
  }

  drawScore(playerScore) {
    this.rootElement.querySelector('.score-box.red').textContent = playerScore[0];
    this.rootElement.querySelector('.score-box.yellow').textContent = playerScore[1];
    this.rootElement.querySelector('.score-box.green').textContent = playerScore[2];
    this.rootElement.querySelector('.score-box.blue').textContent = playerScore[3];
    this.rootElement.querySelector('.score-box.minus').textContent = (playerScore[4] * -1) // only for display;
    this.rootElement.querySelector('.score-box.total').textContent = playerScore[5];
  }

  drawButtons(isCurrentPlayer, playerStage, currentPlayerDiscardedWhite) {
    const throwButton = this.rootElement.querySelector('.throw-dice');
    const discardButton = this.rootElement.querySelector('.discard');    
    const misButton = this.rootElement.querySelector('.mis-throw');

    const canDiscard = playerStage === 'pickingWhite' || (playerStage === 'pickingColor' && !currentPlayerDiscardedWhite);
    const canThrow = playerStage === 'rolling';
    const canMis = isCurrentPlayer && playerStage === 'pickingColor' && currentPlayerDiscardedWhite;

    throwButton.disabled = !canThrow;
    discardButton.disabled = !canDiscard;
    misButton.disabled = !canMis;
  }

  drawMissed(misThrowCount) {
    const fails = this.rootElement.querySelectorAll('.fail-box');
    fails.forEach((fail, i) => {
      if (i < misThrowCount) {
        fail.classList.add('active');
      }
    });
  }

  drawMessage(ctx, playerStage) {
    const messageEl = this.rootElement.querySelector('.message');
    if (ctx.gameover) {
      messageEl.textContent =
        ctx.gameover.winner !== undefined
          ? 'Winner: ' + ctx.gameover.winner
          : 'Draw!';
    } else {
      messageEl.textContent = `It’s player ${ctx.currentPlayer}’s turn. --> ${playerStage}`;
    }
  }
}


const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new QwixxClient(rootElement, { playerID });
});