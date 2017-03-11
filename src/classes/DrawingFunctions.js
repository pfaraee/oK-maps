import chroma from 'chroma-js';

export function drawPoints(ctx, scale, points) {
  var colors = chroma.scale(['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

  for(let i = 0; i < points.length; i++) {
    var color = colors.splice(Math.floor(Math.random() * colors.length - 1), 1);

    for(let j = 0; j < points[i].length; j++) {
      var rgb = hexToRGB(color[0], 0.5);
      console.log(rgb);
      mark(ctx, scale, points[i][j].x, points[i][j].y, 0, rgb);
    }
  }
}

export function drawTerms(ctx, scale, cells) {
  ctx.font = '20pt Roboto';

  for(let i = 0; i < cells.length; i ++) {
    for(let j = 0; j < cells[i].length; j++) {
      ctx.fillText(cells[i][j].status, scale * (cells[i][j].x + 1)+ scale / 2, scale * (cells[i][j].y + 1) + scale / 2);
    }
  }
}

//draws a color on the matching cell
export function mark(ctx, scale, x, y, rotation, color) {
  // saves current context state
  ctx.save();

  // translates the origin of the context
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  // rotates around the origin
  ctx.rotate(rotation * Math.PI / 180);

  //draws match color
  ctx.beginPath();

  ctx.fillStyle = color;
  // subtracts to center the match color
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale /*- 10*/);
  ctx.fillStyle = '#000';

  ctx.restore();
}

export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

// export function randomRGB(length) {
//   var color = Math.floor(Math.random() * length);
//   var colors = chroma.scale(['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800']).colors(length);
//   var hex = colors[color];
//   return hexToRGB(hex, 0.5);
// }
