// Point class
export default class Point {
  constructor(x, y) {
    if((x < 0) || (y < 0)) throw new Error('Coordinates must be positive');
    this.x = x;
    this.y = y;
  }
}
