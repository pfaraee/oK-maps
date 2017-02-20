import { expect } from 'chai';
import Cell from '../src/classes/Cell';

describe('Cell Class', function () {
  describe('constructor(val, x, y)', function() {
    it('throws an error if val is not a positive integer', function () {
      expect(() => new Cell(-2, 0, 0)).to.throw('val must be a valid positive integer.');
      expect(() => new Cell(2.1, 0, 0)).to.throw('val must be a valid positive integer.');
      expect(() => new Cell("1", 0, 0)).to.throw('val must be a valid positive integer.');
      expect(() => new Cell(1, 0, 0)).to.not.throw('val must be a valid positive integer.');
    });

    it('assigns val, x, y as member variables, and status === \'\'', function () {
      const cell = new Cell(4, 2, 3);
      expect(cell).to.have.property('x', 2);
      expect(cell).to.have.property('y', 3);
      expect(cell).to.have.property('val', 4);
      expect(cell).to.have.property('status', '');
    });
  })
});
