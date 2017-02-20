import { expect } from 'chai';
import Point from '../src/classes/Point';

describe('Point Class', function () {
  describe('constructor(x, y)', function() {
    it('throws an error if any coordinate is negative', function () {
      expect(() => new Point(-1, 0)).to.throw('Coordinates must be positive');
      expect(() => new Point(4, -6)).to.throw('Coordinates must be positive');
      expect(() => new Point(-9, -17)).to.throw('Coordinates must be positive');
      expect(() => new Point(2, 0)).to.not.throw('Coordinates must be positive');
    });

    it('assigns x and y as member variables', function () {
      const point = new Point(2, 3);
      expect(point).to.have.property('x', 2);
      expect(point).to.have.property('y', 3);
    });
  })
});
