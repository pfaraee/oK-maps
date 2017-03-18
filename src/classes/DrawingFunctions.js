import chroma from 'chroma-js';

export function drawPoints(ctx, scale, points) {
  var colors = chroma.scale(['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

  for(let i = 0; i < points.length; i++) {
    var color = colors.splice(Math.floor(Math.random() * colors.length - 1), 1);
    var rgb = hexToRGB(color[0], 0.5);

    switch (points[i].type) {
      case "2x2":
        draw2x2(ctx, scale, points[i], rgb);
        continue;
        break;
      case "2x4":
        draw2x4(ctx, scale, points[i], rgb);
        continue;
        break;
      case "1x2":
        draw1x2(ctx, scale, points[i], rgb);
        continue;
        break;
      case "1x4":
        draw1x4(ctx, scale, points[i], rgb);
        continue;
        break;
      case "2x1":
        draw2x1(ctx, scale, points[i], rgb);
        continue;
        break;
      case "4x1":
        draw4x1(ctx, scale, points[i], rgb);                                                                                                                                          (ctx, scale, points[i], rgb);
        continue;
        break;
      case "1x1":
        mark(ctx, scale, points[i].cellArray[0].x, points[i].cellArray[0].y, 0, rgb);
        continue;
        break;
      default:
        console.log("error");
        break;
    }

    for(let j = 0; j < points[i].cellArray.length; j++) {
      console.log(rgb);
      mark(ctx, scale, points[i].cellArray[j].x, points[i].cellArray[j].y, 0, rgb);
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
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale);
  ctx.fillStyle = '#000';

  ctx.restore();
}

function markTL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2 + scale / 10, scale - scale/10, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

function markTM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale, scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

function markBM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

function markBL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2, scale - scale/10, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

function markTR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale - scale/10, scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

function markLM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2 , scale - scale/10, scale);

  ctx.stroke();
  ctx.restore();
}

function markRM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2 , (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 , scale - scale/10, scale);

  ctx.stroke();
  ctx.restore();
}

function markBR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale - scale/10, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

function markT(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2 + scale /10, scale - scale/2.5, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

function markB(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2, scale - scale/2.5, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

function markMV(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2, scale - scale/2.5, scale);

  ctx.stroke();
  ctx.restore();
}

function markMH(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 5, scale, scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

function markL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/10, -scale / 2 + scale /5, scale - scale/10, scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

function markR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 , -scale / 2 + scale/5, scale - scale/10, scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

function draw2x2(ctx, scale, group, color){
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markTR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markBL(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

function draw2x4(ctx, scale, group, color){
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markLM(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);

  markLM(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBL(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);

  markTR(ctx, scale, group.cellArray[4].x, group.cellArray[4].y, color);
  markRM(ctx, scale, group.cellArray[5].x, group.cellArray[5].y, color);

  markRM(ctx, scale, group.cellArray[6].x, group.cellArray[6].y, color);
  markBR(ctx, scale, group.cellArray[7].x, group.cellArray[7].y, color);
}


function draw1x2(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markB(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
}

function draw1x4(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMV(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMV(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markB(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}


function draw4x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMH(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMH(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

function draw2x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
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
