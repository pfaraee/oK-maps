import { expect } from 'chai';
import Cell from '../src/classes/Cell';
import CellArray from '../src/classes/CellArray';
import { decToBin, eliminateTerms, solveGroup, binaryTermToVarTerm, getExpansionFormula } from '../src/classes/BinaryFunctions';

describe('Binary Functions', function () {
  describe('decToBin()', function () {
    it('returns a padded binary number', function () {
      expect(decToBin(3, 3)).to.equal('011');
      expect(decToBin(3, 4)).to.equal('0011');
    });
    it('throws an error if num is greater than 2^vars', function () {
      expect(() => decToBin(4, 2)).to.throw('Error, num must be less than 2^vars');
    });
  });

  describe('combineTerms()', function () {
    it('combines 2 terms', function () {
      var num1 = decToBin(0, 3);
      var num2 = decToBin(1, 3);

      var term = eliminateTerms(num1, num2);
      expect(term).to.equal('00-');
    });
  });

  describe('solveGroup()', function () {
    it('solves any group of a size power of 2', function () {
      let group = [];
      group.push(new Cell(0,0,0));
      group.push(new Cell(1,0,1));

      var term = solveGroup(group, 3);
      expect(term).to.equal('00-');

      group.push(new Cell(3, 0, 2));
      group.push(new Cell(2, 0, 3));

      var term = solveGroup(group, 3);
      expect(term).to.equal('0--');
    });
  });

  describe('binaryTermToVarTerm()', function () {
    it('converts a term in binary form to variable form', function () {
      var varTerm = binaryTermToVarTerm('0--');
      expect(varTerm).to.equal('A\'');
    });
  });

  describe('getExpansionFormula()', function () {
    it('gets the expansion for an array of term groups', function () {
      const cellArray = new CellArray(3);
      cellArray.mark(['1', '1', '1', '1', '1', '1', '1', '0']);

      var groupArray = cellArray.simplifyGroups(cellArray.getGroups());

      var formula = getExpansionFormula(groupArray, 3);

      expect(formula).to.equal("F = A' + B' + C'");
    });
  });
});
