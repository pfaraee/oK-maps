// Cell class
// TODO: eventually remove the cell class as it is redundant
class Cell extends Point {
  constructor(val, x, y, virtual = false) {
    super(x, y);
    this.val = val;
    this.active = false;
    this.virtual = virtual;
  }
}