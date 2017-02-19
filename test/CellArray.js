var expect = require("chai").expect;
import CellArray from '../src/classes/CellArray';

describe("Cell Array Class", function () {
  describe("Cell Marker", function () {
    it("marks the cells with the given terms", function () {
      var cellArray = new CellArray(3);
      cellArray.mark(["0", "1", "X", "0", "1", "X", "1", "0"]);
      expect(cellArray.cells[0][0].status).to.equal("0");
    });
  });
  describe("Cell Reseter", function () {
    it("resets all cells to an empty string", function () {

    });
  });
});
