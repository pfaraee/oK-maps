'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Point class
var Point = function Point(x, y) {
  _classCallCheck(this, Point);

  if (x < 0 || y < 0) throw new Error('Coordinates must be positive');
  this.x = x;
  this.y = y;
};

exports.default = Point;