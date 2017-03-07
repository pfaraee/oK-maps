import { expect } from 'chai';
import * as DrawingFunctions from '../src/classes/DrawingFunctions';

describe('Drawing Functions', function () {
  describe('drawPoints(ctx, scale, points)', function () {
    it('draws every point with the given scale on the given context');
  });
  describe('drawTerms(ctx, scale, cells)', function () {
    it('draws every term with the given scale on the given context');
  });
  describe('mark(ctx, scale, x, y, rotation, color)', function () {
    it('marks a single point with the given scale and rgb array on the given context');
  });
  describe('randomRGB()', function () {
    it('generates an array of random numbers between 0 - 255');
  });
});
