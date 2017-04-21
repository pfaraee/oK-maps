/** Class representing a point. */
export default class Point {
  /**
   * Create a point.
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   */
  constructor(x, y) {
    if((x < 0) || (y < 0)) throw new Error('Coordinates must be positive');
    this.x = x;
    this.y = y;
  }
}
