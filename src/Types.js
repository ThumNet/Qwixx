export class Row {

    constructor(cells) {
        if (cells.length != 11) throw 'A row must consist of 11 cells'

        this.cells = cells;
        this.selected = Array(11).fill(null);
    }

    canLock() {
        return this.selected.filter(c => c === true).length >= 5;
    }

    isLocked() {
        return this.canLock() && this.select[10] === true;
    }

    select(index) {
        this.selected[index] = true;
    }
}

export class Cell {
    construction(number, color) {
        this.number = number;
        this.color = color;
    }
}

const RED = 'red';
const YELLOW = 'yellow';
const GREEN = 'green';
const BLUE = 'blue';

export const DefaultRow1Cells = [
    new Cell(2, RED), new Cell(3, RED), new Cell(4, RED), new Cell(5, RED), new Cell(6, RED), new Cell(7, RED), 
    new Cell(8, RED), new Cell(9, RED), new Cell(10, RED), new Cell(11, RED), new Cell(12, RED)];
export const DefaultRow2Cells = [
    new Cell(2, YELLOW), new Cell(3, YELLOW), new Cell(4, YELLOW), new Cell(5, YELLOW), new Cell(6, YELLOW), new Cell(7, YELLOW), 
    new Cell(8, YELLOW), new Cell(9, YELLOW), new Cell(10, YELLOW), new Cell(11, YELLOW), new Cell(12, YELLOW)];
export const DefaultRow3Cells = [
    new Cell(12, GREEN), new Cell(11, GREEN), new Cell(10, GREEN), new Cell(9, GREEN), new Cell(8, GREEN), new Cell(7, GREEN), 
    new Cell(6, GREEN), new Cell(5, GREEN), new Cell(4, GREEN), new Cell(3, GREEN), new Cell(2, GREEN)];
export const DefaultRow4Cells = [
    new Cell(12, BLUE), new Cell(11, BLUE), new Cell(10, BLUE), new Cell(9, BLUE), new Cell(8, BLUE), new Cell(7, BLUE), 
    new Cell(6, BLUE), new Cell(5, BLUE), new Cell(4, BLUE), new Cell(3, BLUE), new Cell(2, BLUE)];