"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawPoints = drawPoints;
exports.drawTerms = drawTerms;
exports.mark = mark;
exports.randomRGB = randomRGB;
function drawPoints(ctx, scale, points) {
  for (var i = 0; i < points.length; i++) {
    var color = randomRGB();
    for (var j = 0; j < points[i].length; j++) {
      mark(ctx, scale, points[i][j].x, points[i][j].y, 0, color);
    }
  }
}

function drawTerms(ctx, scale, cells) {
  ctx.font = '20pt Roboto';

  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[i].length; j++) {
      ctx.fillText(cells[i][j].status, scale * (cells[i][j].x + 1) + scale / 2, scale * (cells[i][j].y + 1) + scale / 2);
    }
  }
}

//draws a color on the matching cell
function mark(ctx, scale, x, y, rotation, color) {
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

function randomRGB() {
  var red = Math.floor(Math.random() * 256);
  var green = Math.floor(Math.random() * 256);
  var blue = Math.floor(Math.random() * 256);

  return [red, green, blue];
}