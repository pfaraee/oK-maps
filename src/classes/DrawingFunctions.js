import chroma from 'chroma-js';

/**
 * Draws every group onto the kmap
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cells
 * @param {Array.Cell} groups - array of cells
 */
export function drawGroups(ctx, scale, groups) {
  let colors = chroma.scale(['#9c27b0', '#3f51b5', '#03a9f4', '#009688',
  '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

  for(let i = 0; i < groups.length; i++) {
    let rgb;

    if(groups[i].pImp) {
      rgb = hexToRGB('#f44336', 0.7);
    } else {
      let color = colors.splice(Math.floor(Math.random() * colors.length - 1),
      1);
      rgb = hexToRGB(color[0], 0.5);
    }

    switch (groups[i].type) {
      case '2x2':
        draw2x2(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '2x4':
        draw2x4(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '1x2':
        draw1x2(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '1x4':
        draw1x4(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '2x1':
        draw2x1(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '4x1':
        draw4x1(ctx, scale, groups[i], rgb);
        continue;
        break;
      case '1x1':
        mark(ctx, scale, groups[i].cellArray[0].x, groups[i].cellArray[0].y, 0,
          rgb);
        continue;
        break;
      default:
        console.log('error');
        break;
    }

    for(let j = 0; j < groups[i].cellArray.length; j++) {
      console.log(rgb);
      mark(ctx, scale, groups[i].cellArray[j].x, groups[i].cellArray[j].y, 0,
        rgb);
    }
  }
}

/**
 * Marks every cell with its current status
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cells
 * @param {Array.Cell} cells - array of cells
 */
export function drawTerms(ctx, scale, cells) {
  ctx.font = '20pt Roboto';

  for(let i = 0; i < cells.length; i ++) {
    for(let j = 0; j < cells[i].length; j++) {
      ctx.fillText(cells[i][j].status, scale * (cells[i][j].x + 1)+ scale / 2,
      scale * (cells[i][j].y + 1) + scale / 2);
    }
  }
}

/**
 * Marks a cell completely
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {number} rotation - rotation of the cell
 * @param {string} color - the color of the cell
 */
export function mark(ctx, scale, x, y, rotation, color) {
  // saves current context state
  ctx.save();

  // translates the origin of the context
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  // rotates around the origin
  ctx.rotate(rotation * Math.PI / 180);

  // draws match color
  ctx.beginPath();

  ctx.fillStyle = color;
  // subtracts to center the match color
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale);
  ctx.fillStyle = '#000';

  ctx.restore();
}

/**
 * Marks a top left Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markTL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2 + scale / 10,
    scale - scale/10, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a top mid Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markTM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale, scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a bottom mid Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markBM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a bottom left Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markBL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2, scale - scale/10,
    scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a top right Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markTR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale - scale/10,
    scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a left mid Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markLM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2, scale - scale/10, scale);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a right mid Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markRM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale - scale/10, scale);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a bottom right Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markBR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale - scale/10, scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a top Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markT(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2 + scale /10, scale - scale/2.5,
    scale-scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a bottom Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markB(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2, scale - scale/2.5,
    scale - scale/10);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a vertical mid cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markMV(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/5, -scale / 2, scale - scale/2.5, scale);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a horizontal mid cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markMH(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 5, scale, scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a left Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale/10, -scale / 2 + scale /5, scale - scale/10,
    scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

/**
 * Marks a right Cell
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cell
 * @param {number} x - the x coord of the cell
 * @param {number} y - the y coord of the cell
 * @param {string} color - the color of the cell
 */
function markR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale/5, scale - scale/10,
    scale - scale/2.5);

  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a 2x2 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw2x2(ctx, scale, group, color) {
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markTR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markBL(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

/**
 * Draws a 2x4 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw2x4(ctx, scale, group, color) {
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markLM(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);

  markLM(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBL(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);

  markTR(ctx, scale, group.cellArray[4].x, group.cellArray[4].y, color);
  markRM(ctx, scale, group.cellArray[5].x, group.cellArray[5].y, color);

  markRM(ctx, scale, group.cellArray[6].x, group.cellArray[6].y, color);
  markBR(ctx, scale, group.cellArray[7].x, group.cellArray[7].y, color);
}

/**
 * Draws a 1x2 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw1x2(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markB(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
}

/**
 * Draws a 1x4 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw1x4(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMV(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMV(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markB(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

/**
 * Draws a 4x1 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw4x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMH(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMH(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

/**
 * Draws a 2x1 group
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale for the cell
 * @param {Group} group - the group to draw
 * @param {string} color - the color to draw the group
 */
function draw2x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
}


/**
 * Converts a hex color to a rgba color and returns it
 * @param {string} hex - hex string color
 * @param {string} alpha - opacity for the color
 * @return {string} converted rgba color
 */
export function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
