'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CellArray = function () {
  function CellArray(vars) {
    _classCallCheck(this, CellArray);

    if (vars < 4) {
      this.cells = new Array();
      // TODO: remove verbose falses
      // TODO: MAKE ALL VIRTUAL CELLS AT THE RIGHT AND BOTTOM OF EACH MAP, AND
      // MAKE A SEPERATE MAP THAT MARKS ALL PAINTED CELLS
      this.cells.push(new Cell(0, 0, 0, false));
      this.cells.push(new Cell(1, 0, 1, false));
      this.cells.push(new Cell(3, 0, 2, false));
      this.cells.push(new Cell(2, 0, 3, false));
      this.cells.push(new Cell(4, 1, 0, false));
      this.cells.push(new Cell(5, 1, 1, false));
      this.cells.push(new Cell(7, 1, 2, false));
      this.cells.push(new Cell(6, 1, 3, false));
      // virtual cells
      this.cells.push(new Cell(0, 0, 4, true));
      this.cells.push(new Cell(4, 1, 4, true));
    } else {
      // fix this as the coordinates are wrong
      this.cells.push(new Cell(8, 2, 0, false));
      this.cells.push(new Cell(9, 2, 1, false));
      this.cells.push(new Cell(10, 2, 3, false));
      this.cells.push(new Cell(11, 2, 2, false));
      this.cells.push(new Cell(12, 3, 0, false));
      this.cells.push(new Cell(13, 3, 1, false));
      this.cells.push(new Cell(14, 3, 3, false));
      this.cells.push(new Cell(15, 3, 2, false));

      //TODO: add virtual cells for 4 var kmap
    }
    // holds all marked groups
  }

  _createClass(CellArray, [{
    key: 'mark',
    value: function mark(terms) {
      console.log(this.cells);
      for (var i = 0; i < terms.length; i++) {
        // for each minterm
        for (var j = 0; j < this.cells.length; j++) {
          if (this.cells[j].val === terms[i]) {
            this.cells[j].active = true;
          }
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      console.log(this.cells);
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].active = false;
      }
    }
  }, {
    key: 'drawTerms',
    value: function drawTerms() {
      ctx.font = '20pt Roboto';

      for (var i = 0; i < this.cells.length; i++) {
        if (this.cells[i].active == 1) {
          ctx.fillText('1', scale * (this.cells[i].x + 1) + scale / 2, scale * (this.cells[i].y + 1) + scale / 2);
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

      for (var i = 0; i < this.cells.length; i++) {
        if (this.cells[i].active && !this.cells[i].virtual) numActive++;
      }
      console.log(numActive);

      if (numActive >= 8) {
        // draws if all are on
        var group = [];

        for (var j = 0; j < this.cells.length; j++) {
          if (!this.cells[j].virtual) {
            group.push(new Point(this.cells[j].x, this.cells[j].y));
          }
        }

        marked.push(group);

        return; // all are marked
      }

      if (numActive >= 4) {
        console.log("quads");
        //marks "quads"
        for (var _i = 0; _i <= 1; _i++) {
          if (this.search(_i, 0).active && this.search(_i, 1).active && this.search(_i, 2).active && this.search(_i, 3).active) {
            var _group = [];

            for (var _j = 0; _j < 4; _j++) {
              _group.push(new Point(_i, _j));
            }

            marked.push(_group);
          }
        }

        //marks "boxes"
        for (var _i2 = 0; _i2 < 4; _i2++) {
          if (this.search(0, _i2).active && this.search(1, _i2).active && this.search(0, _i2 + 1).active && this.search(1, _i2 + 1).active) {
            var _group2 = [];

            // over kill because im going to expand to 4 vars later
            //TODO: fix for 4+ vars
            for (var _j2 = 0; _j2 <= 1; _j2++) {
              for (var k = 0; k <= 1; k++) {
                // let x = j;
                // let y = i + k;
                // x %= 4;
                // y %= 4;
                // if it is a "virtual" cell it is reset to its original position.
                _group2.push(new Point(_j2 % 4, (_i2 + k) % 4));
              }
            }

            marked.push(_group2);
          }
        }
      }

      if (numActive >= 2) {
        console.log("hello?");
        for (var _i3 = 0; _i3 < 2; _i3++) {
          for (var _j3 = 0; _j3 < 4; _j3++) {
            console.log("doing pairs now");
            // Horizontal pairs
            if (this.search(_i3, _j3).active && this.search(_i3 + 1, _j3).active) {
              var _group3 = [];

              _group3.push(new Point(_i3 % 4, _j3 % 4));
              _group3.push(new Point((_i3 + 1) % 4, _j3 % 4));

              if (this.isGroupUnique(marked, _group3)) marked.push(_group3);
            }

            //vertical                                                  // temp fix just because it is hardcoded for 2 rn
            if (this.search(_i3, _j3).active && this.search(_i3, _j3 + 1) && this.search(_i3, _j3 + 1).active) {
              var _group4 = [];

              _group4.push(new Point(_i3 % 4, _j3 % 4));
              _group4.push(new Point(_i3 % 4, (_j3 + 1) % 4));

              if (this.isGroupUnique(marked, _group4)) marked.push(_group4);
            }
          }
        }
      }

      console.log(marked);

      return marked;
    }
  }, {
    key: 'search',
    value: function search(x, y) {
      for (var i = 0; i < this.cells.length; i++) {
        if (this.cells[i]["x"] === x && this.cells[i]["y"] === y) {
          return this.cells[i];
        }
      }
      return false;
    }
  }, {
    key: 'isGroupUnique',
    value: function isGroupUnique(marked, group) {
      var matches = 0;

      if (typeof marked === 'undefined' || marked === null) {
        console.log("marked is empty");
        return true;
      }

      // ends too quickly
      for (var i = 0; i < marked.length; i++) {
        for (var j = 0; j < group.length; j++) {
          for (var k = 0; k < marked[i].length; k++) {
            if (marked[i][k].x == group[j].x && marked[i][k].y == group[j].y) {
              matches++;
            }
          }
        }
      }
      console.log(matches);
      // too many matches
      if (matches > group.length / 2) {
        console.log("false");
        return false;
      }
      console.log("true");
      return true;
    }
  }]);

  return CellArray;
}();