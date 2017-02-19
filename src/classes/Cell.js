import Point from './Point';
// Cell class
// TODO: eventually remove the cell class as it is redundant
export default class Cell extends Point {
  constructor(val, x, y) {
    super(x, y);
    this.val = val;
    this.status = "";
  }
}
