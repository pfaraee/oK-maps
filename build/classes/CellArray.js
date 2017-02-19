"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CellArray = function () {
  function CellArray(vars) {
    _classCallCheck(this, CellArray);

    this.cells = new Array();

    this.cells[0] = new Array();
    this.cells[0].push(new Cell(0, 0, 0));
    this.cells[0].push(new Cell(4, 1, 0));

    this.cells[1] = new Array();
    this.cells[1].push(new Cell(1, 0, 1));
    this.cells[1].push(new Cell(5, 1, 1));

    this.cells[2] = new Array();
    this.cells[2].push(new Cell(3, 0, 2));
    this.cells[2].push(new Cell(7, 1, 2));

    this.cells[3] = new Array();
    this.cells[3].push(new Cell(2, 0, 3));
    this.cells[3].push(new Cell(6, 1, 3));

    if (vars > 3) {

      this.cells.push(new Cell(8, 3, 0, false));
      this.cells.push(new Cell(9, 3, 1, false));
      this.cells.push(new Cell(10, 3, 3, false));
      this.cells.push(new Cell(11, 3, 2, false));
      this.cells.push(new Cell(12, 2, 0, false));
      this.cells.push(new Cell(13, 2, 1, false));
      this.cells.push(new Cell(14, 2, 3, false));
      this.cells.push(new Cell(15, 2, 2, false));

      //TODO: add virtual cells for 4 var kmap
      this.cells.push(new Cell(0, 4, 0, true));
      this.cells.push(new Cell(1, 4, 1, true));
      this.cells.push(new Cell(3, 4, 2, true));
      this.cells.push(new Cell(2, 4, 3, true));
      this.cells.push(new Cell(0, 4, 4, true));
      this.cells.push(new Cell(8, 2, 3, true));
      this.cells.push(new Cell(12, 2, 2, true));
    }
    // holds all marked groups
  }

  _createClass(CellArray, [{
    key: "mark",
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
    key: "reset",
    value: function reset() {
      // console.log(this.cells);
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].status = "";
      }
    }
  }, {
    key: "drawTerms",
    value: function drawTerms() {
      ctx.font = '20pt Roboto';

      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          ctx.fillText(this.cells[i][j].status, scale * (this.cells[i][j].x + 1) + scale / 2, scale * (this.cells[i][j].y + 1) + scale / 2);
        }
      }
    }

    //Writing this near midnight
    // TODO: write it better later

  }, {
    key: "getGroups",
    value: function getGroups() {
      var marked = [];
      // used to skip some group checks
      var numActive = 0;

      // TODO: refractor to work with maxterms
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          if (this.cells[i][j].status != "0") numActive++;
        }
      }

      if (numActive >= 8) {
        // draws if all are on
        var group = [];

        for (var _i = 0; _i < this.cells.length; _i++) {
          for (var _j = 0; _j < this.cells[_i].length; _j++) {
            group.push(new Point(this.cells[_i][_j].x, this.cells[_i][_j].y));
          }
        }

        marked.push(group);

        return marked; // all are marked
      }

      if (numActive >= 4) {
        //marks "quads"
        for (var _i2 = 0; _i2 < 2; _i2++) {
          var rootPoint = this.get(_i2, 0);
          var secondPoint = this.get(_i2, 1);
          var thirdPoint = this.get(_i2, 2);
          var fourthPoint = this.get(_i2, 3);

          if (rootPoint.status != "0" && secondPoint.status != "0" && thirdPoint.status != "0" && fourthPoint.status != "0" && (rootPoint.status == "1" || secondPoint.status == "1" || thirdPoint.status == "1" || fourthPoint.status == "1")) {
            var _group = [];

            for (var _j2 = 0; _j2 < 4; _j2++) {
              _group.push(new Point(_i2, _j2));
            }

            marked.push(_group);
          }
        }

        //marks "boxes"
        for (var _i3 = 0; _i3 < 4; _i3++) {
          var _rootPoint = this.get(0, _i3);
          var _secondPoint = this.get(1, _i3);
          var _thirdPoint = this.get(0, _i3 + 1);
          var _fourthPoint = this.get(1, _i3 + 1);

          if (_rootPoint.status != "0" && _secondPoint.status != "0" && _thirdPoint.status != "0" && _fourthPoint.status != "0" && (_rootPoint.status == "1" || _secondPoint.status == "1" || _thirdPoint.status == "1" || _fourthPoint.status == "1")) {
            var _group2 = [];

            _group2.push(new Point(_rootPoint.x, _rootPoint.y));
            _group2.push(new Point(_secondPoint.x, _secondPoint.y));
            _group2.push(new Point(_thirdPoint.x, _thirdPoint.y));
            _group2.push(new Point(_fourthPoint.x, _fourthPoint.y));

            marked.push(_group2);
          }
        }
      }
      console.log(this.cells);
      // TODO: remove verbose searches
      if (numActive >= 2) {
        for (var _i4 = 0; _i4 < Math.pow(2, numVars - 2); _i4++) {
          for (var _j3 = 0; _j3 < 4; _j3++) {
            // Horizontal pairs
            var _rootPoint2 = this.get(_i4, _j3);
            if (_rootPoint2.status == "1" && this.isAlreadyMatched(marked, new Point(_rootPoint2.x, _rootPoint2.y))) continue;
            var _secondPoint2 = this.get(_i4 + 1, _j3);
            if (_rootPoint2.status != "0" && _secondPoint2.status != "0" && (_rootPoint2.status == "1" || _secondPoint2.status == "1")) {
              var _group3 = [];

              _group3.push(new Point(_rootPoint2.x, _rootPoint2.y));
              _group3.push(new Point(_secondPoint2.x, _secondPoint2.y));

              if (this.isGroupUnique(marked, _group3)) marked.push(_group3);
            }

            //vertical                                                  // temp fix just because it is hardcoded for 2 rn
            var secondPointV = this.get(_i4, _j3 + 1);
            if (_rootPoint2.status != "0" && secondPointV.status != "0" && (_rootPoint2.status == "1" || secondPointV.status == "1")) {
              var _group4 = [];

              _group4.push(new Point(_rootPoint2.x, _rootPoint2.y));
              _group4.push(new Point(secondPointV.x, secondPointV.y));

              if (this.isGroupUnique(marked, _group4)) marked.push(_group4);
            }
          }
        }
      }
      // console.log(marked);

      return marked;
    }

    // mods coords for overflow and swaps them because array xy and map xy are flipped

  }, {
    key: "get",
    value: function get(x, y) {
      return this.cells[y % 4][x % Math.pow(2, numVars - 2)];
    }
  }, {
    key: "isAlreadyMatched",
    value: function isAlreadyMatched(marked, point) {
      for (var i = 0; i < marked.length; i++) {
        for (var j = 0; j < marked[i].length; j++) {
          if (marked[i][j].x == point.x && marked[i][j].y == point.y) {
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: "isGroupUnique",
    value: function isGroupUnique(marked, group) {
      if (typeof marked === 'undefined' || marked === null) {
        console.log("marked is empty");
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
  }]);

  return CellArray;
}();