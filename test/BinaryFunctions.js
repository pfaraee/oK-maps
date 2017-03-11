import { expect } from 'chai';
import Cell from '../src/classes/Cell';
import CellArray from '../src/classes/CellArray';
import { decToBin, eliminateTerms, solveGroup, binaryTermToVarTerm, getExpansionFormula } from '../src/classes/BinaryFunctions';

describe('Binary Functions', function () {
  describe('decToBin(num, vars)', function () {
    it('returns a padded binary number for the given number of vars', function () {
      expect(decToBin(0, 3)).to.equal('000');
      expect(decToBin(0, 4)).to.equal('0000');
      expect(decToBin(0, 5)).to.equal('00000');
      expect(decToBin(0, 6)).to.equal('000000');

      expect(decToBin(3, 3)).to.equal('011');
      expect(decToBin(3, 4)).to.equal('0011');
      expect(decToBin(3, 5)).to.equal('00011');
      expect(decToBin(3, 6)).to.equal('000011');

      expect(decToBin(7, 3)).to.equal('111');
      expect(decToBin(15, 4)).to.equal('1111');
      expect(decToBin(31, 5)).to.equal('11111');
      expect(decToBin(63, 6)).to.equal('111111');
    });

    it('throws an Invalid number error if num is greater than 2^vars or negative', function () {
      expect(() => decToBin(-3, 5)).to.throw('Invalid Number');

      expect(() => decToBin(4, 2)).to.throw('Invalid Number');
      expect(() => decToBin(9, 3)).to.throw('Invalid Number');
      expect(() => decToBin(9, 2)).to.throw('Invalid Number');
      expect(() => decToBin(16, 4)).to.throw('Invalid Number');
      expect(() => decToBin(32, 5)).to.throw('Invalid Number');
      expect(() => decToBin(64, 6)).to.throw('Invalid Number');
    });
  });

  describe('eliminateTerms(term1, term2)', function () {
    it('eliminates a term', function () {
      var term1 = decToBin(0, 3);
      var term2 = decToBin(1, 3);

      var resultTerm = eliminateTerms(term1, term2);
      expect(resultTerm).to.equal('00-');
    });

    it('throws an error when given unsimplifiable terms', function () {
      expect(() => eliminateTerms('000', '101')).to.throw('Unsimplifiable Terms Given');
    });
  });

  describe('solveGroup(group, vars)', function () {
    it('solves any group of a length that is a power of 2', function () {
      let group = [];
      group.push(new Cell(0,0,0));
      var term = solveGroup(group, 3);
      expect(term).to.equal('000');

      group.push(new Cell(1,0,1));

      var term = solveGroup(group, 3);
      expect(term).to.equal('00-');

      group.push(new Cell(3, 0, 2));
      group.push(new Cell(2, 0, 3));

      var term = solveGroup(group, 3);
      expect(term).to.equal('0--');

      var term = solveGroup(group, 4);
      expect(term).to.equal('00--');
    });

    it('throws an error if group length is a non power of two or greater than 2^vars', function () {
      let group = [];

      // Group of 3
      group.push(new Cell(0,0,0));
      group.push(new Cell(1,0,1));
      group.push(new Cell(3, 0, 2));
      expect(() => solveGroup(group, 3)).to.throw("Invalid Group");

      // Group of 6
      group.push(new Cell(2, 0, 3));
      group.push(new Cell(3, 0, 2));
      group.push(new Cell(3, 0, 2));

      expect(() => solveGroup(group, 3)).to.throw("Invalid Group");

      // group size over 2^vars
      group.push(new Cell(3, 0, 2));
      group.push(new Cell(3, 0, 2));
      group.push(new Cell(3, 0, 2));
      group.push(new Cell(3, 0, 2));
      expect(() => solveGroup(group, 3)).to.throw("Invalid Group");
    })
  });

  describe('binaryTermToVarTerm(term)', function () {
    it('converts a term in binary form to variable form', function () {
      var varTerm = binaryTermToVarTerm('0--');
      expect(varTerm).to.equal('A\'');

      varTerm = binaryTermToVarTerm('---');
      expect(varTerm).to.equal('');

      varTerm = binaryTermToVarTerm('');
      expect(varTerm).to.equal('Undefined Term');
    });
  });

  describe('getExpansionFormula(groups, vars)', function () {
    it('gets the expansion for an array of term groups', function () {
      const cellArray = new CellArray(3, '1');
      cellArray.mark(['1', '1', '1', '1', '1', '1', '1', '0']);

      var groupArray = cellArray.simplifyGroups(cellArray.getGroups());

      var formula = getExpansionFormula(groupArray, 3, 1);

      expect(formula).to.equal("F = A' + B' + C'");
    });
  });
});
