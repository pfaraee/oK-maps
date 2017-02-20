import { expect } from 'chai';
import CellArray from '../src/classes/CellArray';
import Point from '../src/classes/Point';

describe('Cell Array Class', function () {
  describe('mark()', function () {
    it('marks the cells with the given terms', function () {
      let cellArray = new CellArray(3);

      cellArray.mark(['0', '1', 'X', '0', '1', 'X', '1', '0']);

      // mind the order of the cells
      expect(cellArray.cells[0][0].status).to.equal('0'); // 0
      expect(cellArray.cells[0][1].status).to.equal('1'); // 4
      expect(cellArray.cells[1][0].status).to.equal('1'); // 1
      expect(cellArray.cells[1][1].status).to.equal('X'); // 5
      expect(cellArray.cells[2][0].status).to.equal('0'); // 3
      expect(cellArray.cells[2][1].status).to.equal('0'); // 7
      expect(cellArray.cells[3][0].status).to.equal('X'); // 2
      expect(cellArray.cells[3][1].status).to.equal('1'); // 6
    });
  });

  describe('reset()', function () {
    it('resets all cells to an empty string', function () {
      let cellArray = new CellArray(3);

      cellArray.mark(['0', '1', 'X', '0', '1', 'X', '1', '0']);

      // TODO: Should I first prove that the cells were marked?

      cellArray.reset();

      expect(cellArray.cells[0][0].status).to.equal(''); // 0
      expect(cellArray.cells[0][1].status).to.equal(''); // 4
      expect(cellArray.cells[1][0].status).to.equal(''); // 1
      expect(cellArray.cells[1][1].status).to.equal(''); // 5
      expect(cellArray.cells[2][0].status).to.equal(''); // 3
      expect(cellArray.cells[2][1].status).to.equal(''); // 7
      expect(cellArray.cells[3][0].status).to.equal(''); // 2
      expect(cellArray.cells[3][1].status).to.equal(''); // 6
    });
  });

  describe('get()', function () {
    it('returns cell in respect of the cells array', function () {
      let cellArray = new CellArray(3);

      let cell1 = cellArray.get(1, 1);
      expect(cell1.val).to.equal(5);
      expect(cell1.x).to.equal(1);
      expect(cell1.y).to.equal(1);

      let cell2 = cellArray.get(0, 3);
      expect(cell2.val).to.equal(2);
      expect(cell2.x).to.equal(0);
      expect(cell2.y).to.equal(3);
    });

    it('mods coordinates that overflow the range of the map', function () {
      let cellArray = new CellArray(3);

      let cell1 = cellArray.get(1, 4); //tests y overflow
      expect(cell1.val).to.equal(4);
      expect(cell1.x).to.equal(1);
      expect(cell1.y).to.equal(0);

      let cell2 = cellArray.get(3, 2); //tests  xoverflow
      expect(cell2.val).to.equal(7);
      expect(cell2.x).to.equal(1);
      expect(cell2.y).to.equal(2);
    });
  });

  describe('isGroupUnique()', function () {
    it('returns true if marked is empty', function () {
      let cellArray = new CellArray(3);

      let marked = [];

      let group = [];
      group.push(new Point(0, 1));
      group.push(new Point(4, 5));

      expect(marked).to.be.empty;
      expect(cellArray.isGroupUnique(marked, group)).to.be.true;
    });

    it('returns whether or not the group is inside a different group', function () {
      let cellArray = new CellArray(3);

      let marked = [];

      let group1 = [];
      group1.push(new Point(0, 0));
      group1.push(new Point(0, 1));
      marked.push(group1);

      let group2 = [];
      group2.push(new Point(0, 1));
      group2.push(new Point(0, 2));
      group2.push(new Point(1, 1));
      group2.push(new Point(1, 2));
      marked.push(group2);

      let testGroup1 = [];
      testGroup1.push(new Point(0, 1));
      testGroup1.push(new Point(0, 2));

      let testGroup2 = [];
      testGroup2.push(new Point(0, 2));
      testGroup2.push(new Point(1, 2));

      let testGroup3 = [];
      testGroup3.push(new Point(0, 3));
      testGroup3.push(new Point(0, 4));

      let testGroup4 = [];
      testGroup4.push(new Point(1, 2));
      testGroup4.push(new Point(1, 3));


      expect(cellArray.isGroupUnique(marked, testGroup1)).to.be.false;
      expect(cellArray.isGroupUnique(marked, testGroup2)).to.be.false;
      expect(cellArray.isGroupUnique(marked, testGroup3)).to.be.true;
      expect(cellArray.isGroupUnique(marked, testGroup4)).to.be.true;
    });
  });

  describe('getGroups()', function () {
    // TODO: write this test
    it('returns best groups from the possible minterms');
  });
});
