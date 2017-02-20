import Point from './Point';
// Cell class
// TODO: eventually remove the cell class as it is redundant
export default class Cell extends Point {
  constructor(val, x, y) {
    if(typeof val !== 'number' || (val % 1) !== 0 || val < 0) throw new Error('val must be a valid positive integer.');
    super(x, y);
    this.val = Number(val);
    this.status = '';
  }
}
