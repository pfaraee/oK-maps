'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cell = require('./Cell');

var _Cell2 = _interopRequireDefault(_Cell);

var _Point = require('./Point');

var _Point2 = _interopRequireDefault(_Point);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CellArray = function () {
  function CellArray(vars) {
    _classCallCheck(this, CellArray);

    this.vars = vars;
    this.cells = new Array();

    this.cells[0] = new Array();
    this.cells[0].push(new _Cell2.default(0, 0, 0));
    this.cells[0].push(new _Cell2.default(4, 1, 0));

    this.cells[1] = new Array();
    this.cells[1].push(new _Cell2.default(1, 0, 1));
    this.cells[1].push(new _Cell2.default(5, 1, 1));

    this.cells[2] = new Array();
    this.cells[2].push(new _Cell2.default(3, 0, 2));
    this.cells[2].push(new _Cell2.default(7, 1, 2));

    this.cells[3] = new Array();
    this.cells[3].push(new _Cell2.default(2, 0, 3));
    this.cells[3].push(new _Cell2.default(6, 1, 3));

    if (this.vars > 3) {

      this.cells.push(new _Cell2.default(8, 3, 0, false));
      this.cells.push(new _Cell2.default(9, 3, 1, false));
      this.cells.push(new _Cell2.default(10, 3, 3, false));
      this.cells.push(new _Cell2.default(11, 3, 2, false));
      this.cells.push(new _Cell2.default(12, 2, 0, false));
      this.cells.push(new _Cell2.default(13, 2, 1, false));
      this.cells.push(new _Cell2.default(14, 2, 3, false));
      this.cells.push(new _Cell2.default(15, 2, 2, false));

      //TODO: add virtual cells for 4 var kmap
      this.cells.push(new _Cell2.default(0, 4, 0, true));
      this.cells.push(new _Cell2.default(1, 4, 1, true));
      this.cells.push(new _Cell2.default(3, 4, 2, true));
      this.cells.push(new _Cell2.default(2, 4, 3, true));
      this.cells.push(new _Cell2.default(0, 4, 4, true));
      this.cells.push(new _Cell2.default(8, 2, 3, true));
      this.cells.push(new _Cell2.default(12, 2, 2, true));
    }
    // holds all marked groups
  }

  _createClass(CellArray, [{
    key: 'mark',
    value: function mark(terms) {
      // console.log(terms);
      for (var i = 0; i < terms.length; i++) {
        // for each minterm
        for (var j = 0; j < this.cells.length; j++) {
          for (var k = 0; k < this.cells[j].length; k++) {
            if (this.cells[j][k].val === i) {
              this.cells[j][k].status = terms[i];
            }
          }
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      // console.log(this.cells);
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].status = '';
        }
      }
    }

    //Writing this near midnight
    // TODO: write it better later

  }, {
    key: 'getGroups',
    value: function getGroups() {
      var marked = [];
      // used to skip some group checks
      var numActive = 0;

      // TODO: refractor to work with maxterms
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          if (this.cells[i][j].status != '0') numActive++;
        }
      }

      if (numActive >= 8) {
        // draws if all are on
        var group = [];

        for (var _i = 0; _i < this.cells.length; _i++) {
          for (var _j = 0; _j < this.cells[_i].length; _j++) {
            group.push(this.cells[_i][_j]);
          }
        }

        marked.push(group);

        return marked; // all are marked
      }

      if (numActive >= 4) {
        //marks 'quads'
        for (var _i2 = 0; _i2 < 2; _i2++) {
          var rootPoint = this.get(_i2, 0);
          var secondPoint = this.get(_i2, 1);
          var thirdPoint = this.get(_i2, 2);
          var fourthPoint = this.get(_i2, 3);

          if (rootPoint.status !== '0' && secondPoint.status !== '0' && thirdPoint.status !== '0' && fourthPoint.status !== '0' && (rootPoint.status === '1' || secondPoint.status === '1' || thirdPoint.status === '1' || fourthPoint.status === '1')) {
            var _group = [];

            _group.push(rootPoint);
            _group.push(secondPoint);
            _group.push(thirdPoint);
            _group.push(fourthPoint);

            marked.push(_group);
          }
        }

        //marks 'boxes'
        for (var _i3 = 0; _i3 < 4; _i3++) {
          var _rootPoint = this.get(0, _i3);
          var _secondPoint = this.get(1, _i3);
          var _thirdPoint = this.get(0, _i3 + 1);
          var _fourthPoint = this.get(1, _i3 + 1);

          if (_rootPoint.status !== '0' && _secondPoint.status !== '0' && _thirdPoint.status !== '0' && _fourthPoint.status !== '0' && (_rootPoint.status === '1' || _secondPoint.status === '1' || _thirdPoint.status === '1' || _fourthPoint.status === '1')) {
            var _group2 = [];

            _group2.push(_rootPoint);
            _group2.push(_secondPoint);
            _group2.push(_thirdPoint);
            _group2.push(_fourthPoint);

            marked.push(_group2);
          }
        }
      }

      // TODO: remove verbose searches
      if (numActive >= 2) {
        for (var _i4 = 0; _i4 < Math.pow(2, this.vars - 2); _i4++) {
          for (var _j2 = 0; _j2 < 4; _j2++) {
            var _rootPoint2 = this.get(_i4, _j2);

            //horizontal
            var _secondPoint2 = this.get(_i4 + 1, _j2);
            if (_rootPoint2.status !== '0' && _secondPoint2.status !== '0' && (_rootPoint2.status === '1' || _secondPoint2.status === '1')) {
              var _group3 = [];
              _group3.push(_rootPoint2);
              _group3.push(_secondPoint2);

              if (this.isGroupUnique(marked, _group3)) marked.push(_group3);
            }

            //vertical
            var secondPointV = this.get(_i4, _j2 + 1);
            if (_rootPoint2.status !== '0' && secondPointV.status !== '0' && (_rootPoint2.status === '1' || secondPointV.status === '1')) {
              var _group4 = [];
              _group4.push(_rootPoint2);
              _group4.push(secondPointV);

              if (this.isGroupUnique(marked, _group4)) marked.push(_group4);
            }
          }
        }
      }
      console.log(marked);
      return marked;
    }

    // mods coords for overflow and swaps them because array xy and map xy are flipped

  }, {
    key: 'get',
    value: function get(x, y) {
      return this.cells[y % 4][x % Math.pow(2, this.vars - 2)];
    }
  }, {
    key: 'isGroupUnique',
    value: function isGroupUnique(marked, group) {
      if (typeof marked === 'undefined' || marked === null) {
        console.log('marked is empty');
        return true;
      }
      for (var i = 0; i < marked.length; i++) {
        //for each marked group
        var matches = [];

        for (var j = 0; j < group.length; j++) {
          // for each point in the group
          for (var k = 0; k < marked[i].length; k++) {
            // for each point in the marked group
            if (marked[i][k].x == group[j].x && marked[i][k].y == group[j].y) {
              matches.push(group[j]);
            }
          }
        }

        if (matches.length > group.length / 2) return false;
      }

      return true;
    }
  }, {
    key: 'simplifyGroups',
    value: function simplifyGroups(groups) {
      for (var i = 0; i < groups.length; i++) {
        // for each group
        var numberOfOnes = 0;
        var matches = 0;

        for (var j = 0; j < groups[i].length; j++) {
          // for each point in the group
          // if it is a 1 increment number of ones otherwise skip this loop
          if (groups[i][j].status !== '1') continue;
          numberOfOnes++;

          // check every 1 in the array of groups for matching (x & y's) and
          // increment matches if it is in a different group than the current group
          pairing: for (var k = 0; k < groups.length; k++) {
            for (var l = 0; l < groups[k].length; l++) {
              if (groups[k][l].status === '1' && groups[i][j].x === groups[k][l].x && groups[i][j].y === groups[k][l].y && i !== k) {
                matches++;
                break pairing; // used to break out of both loops
              }
            }
          }
        }

        // removes the group and decrements the count by 1
        if (matches && numberOfOnes && numberOfOnes === matches) {
          groups.splice(i, 1);
          i--;
        }
      }
      //TODO: ask professor if this is good
      return groups.map(function (group) {
        return group.map(function (cell) {
          return new _Point2.default(cell.x, cell.y);
        });
      });
    }
  }]);

  return CellArray;
}();

exports.default = CellArray;