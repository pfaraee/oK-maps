"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Group class used for drawing
var Group = function Group(cellArray, type) {
  _classCallCheck(this, Group);

  this.cellArray = cellArray;
  this.type = type;
};

exports.default = Group;