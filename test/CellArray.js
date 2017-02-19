import { expect } from 'chai';
import CellArray from '../src/classes/CellArray';

describe("Cell Array Class", function () {
  describe("Cell Marker", function () {
    it("marks the cells with the given terms", function () {
      let cellArray = new CellArray(3);

      cellArray.mark(["0", "1", "X", "0", "1", "X", "1", "0"]);

      // mind the order of the cells
      expect(cellArray.cells[0][0].status).to.equal("0"); // 0
      expect(cellArray.cells[0][1].status).to.equal("1"); // 4
      expect(cellArray.cells[1][0].status).to.equal("1"); // 1
      expect(cellArray.cells[1][1].status).to.equal("X"); // 5
      expect(cellArray.cells[2][0].status).to.equal("0"); // 3
      expect(cellArray.cells[2][1].status).to.equal("0"); // 7
      expect(cellArray.cells[3][0].status).to.equal("X"); // 2
      expect(cellArray.cells[3][1].status).to.equal("1"); // 6
    });
  });
  
  describe("Cell Reseter", function () {
    it("resets all cells to an empty string", function () {
      let cellArray = new CellArray(3);

      cellArray.mark(["0", "1", "X", "0", "1", "X", "1", "0"]);

      cellArray.reset();

      expect(cellArray.cells[0][0].status).to.equal(""); // 0
      expect(cellArray.cells[0][1].status).to.equal(""); // 4
      expect(cellArray.cells[1][0].status).to.equal(""); // 1
      expect(cellArray.cells[1][1].status).to.equal(""); // 5
      expect(cellArray.cells[2][0].status).to.equal(""); // 3
      expect(cellArray.cells[2][1].status).to.equal(""); // 7
      expect(cellArray.cells[3][0].status).to.equal(""); // 2
      expect(cellArray.cells[3][1].status).to.equal(""); // 6
    });
  });
});
