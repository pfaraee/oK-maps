/** Class representing a group. */
export default class Group {
  /**
     * Create a dot.
     * @param {Array.Point} cellArray - array holding all the groups points
     * @param {string} type - the type of group it is
     */
  constructor(cellArray, type) {
    this.cellArray = cellArray;
    this.type = type;
    this.pImp = false;
  }
}
