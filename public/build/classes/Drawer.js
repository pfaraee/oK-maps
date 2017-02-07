"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Drawer = function () {
  // takes an array of points
  function Drawer(points) {
    _classCallCheck(this, Drawer);

    this.points = points;
  }

  _createClass(Drawer, [{
    key: "drawPoints",
    value: function drawPoints() {
      for (var i = 0; i < this.points.length; i++) {
        var color = this.randomRGB();
        for (var j = 0; j < this.points[i].length; j++) {
          this.mark(this.points[i][j].x, this.points[i][j].y, 0, color);
        }
      }
    }

    //draws a color on the matching cell

  }, {
    key: "mark",
    value: function mark(x, y, rotation, color) {
      console.log("hello");
      // saves current context state
      ctx.save();

      // translates the origin of the context
      ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
      // rotates around the origin
      ctx.rotate(rotation * Math.PI / 180);

      //draws match color
      ctx.beginPath();

      ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.3)";
      // subtracts to center the match color
      ctx.fillRect(-scale / 2, -scale / 2, scale, scale /*- 10*/);
      ctx.fillStyle = '#000';

      ctx.restore();
    }
  }, {
    key: "randomRGB",
    value: function randomRGB() {
      var red = Math.floor(Math.random() * 256);
      var green = Math.floor(Math.random() * 256);
      var blue = Math.floor(Math.random() * 256);

      return [red, green, blue];
    }
  }]);

  return Drawer;
}();