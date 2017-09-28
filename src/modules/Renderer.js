import chroma from 'chroma-js';
import { decToBin, toGrayCode } from './BinaryFunctions';

export default class Renderer {
  /**
   * constructor
   * @param {Stage} stage - konva stage
   * @param {number} vars - number of vars for the map (used primarily for scaling)
   */
  constructor(stage, vars) {
    this.stage = stage;
    this.vars = vars;
  }

  /**
   * calculates scale for every cell
   * @param {number} width - width of scale
   * @param {number} vars - number of vars for the map
   */
  calculateScale(width, vars) {
    let maxAxisVars = vars - Math.floor(vars / 2);

    return (width / (Math.pow(2, maxAxisVars) + 1)) - 5;
  }

  /**
   * draws the entire kmap
   */
  drawMap() {
    this.stage.destroyChildren(); // IMPORTANT. resets map

    let vars = this.vars; // these two added just so I can type less
    let stage = this.stage;

    // amount of vars for each Axis
    let xVars = vars - Math.floor(vars / 2) - (vars % 2);
    let yVars = vars - Math.floor(vars / 2);

    // cell length for each Axis
    let xLength = Math.pow(2, xVars);
    let yLength = Math.pow(2, yVars);

    var scale = this.calculateScale(stage.width(), vars);

    let mainLayer = new Konva.Layer();

    // visual line... no real purpose
    var line = new Konva.Line({
      points: [0, 0, scale, scale],
      stroke: 'black',
      tension: 1,
      strokeWidth: 1
    });
    mainLayer.add(line);

    // cells
    for(let i = 0; i < xLength; i++) {
      for(let j = 0 ; j < yLength; j++) {
        let rect = new Konva.Rect({
          x: i * (scale) + scale ,
          y: j * (scale) + scale ,
          width: scale ,
          height: scale ,
          stroke: 'black',
          strokeWidth: 1
        });

        mainLayer.add(rect);
      }
    }

    // axis variable labels
    let xStr = "";
    let yStr = "";
    for(let i = 0; i < xVars; i++) xStr += String.fromCharCode(65 + i);
    for(let i = 0; i < yVars; i++) yStr += String.fromCharCode(65 + xVars + i);
    
    let xLabel = new Konva.Text({
      y: 0 ,
      text: xStr,
      fontSize: scale / 3,
      fontFamily: 'Roboto',
      fill: 'black'
    });
    xLabel.x(scale / 2 - xLabel.width()/4);
    mainLayer.add(xLabel);

    let yLabel = new Konva.Text({
      x: 0,
      text: yStr,
      fontSize: scale / 3,
      fontFamily: 'Roboto',
      fill: 'black'
    });
    yLabel.y(scale / 2 + yLabel.width()/4);
    mainLayer.add(yLabel);

    // x axis numbers
    for(let i = 0; i < xLength; i++) {
      let str = decToBin(toGrayCode(i), xVars);
      
      let num = new Konva.Text({
        text: str,
        fontSize: scale / 3,
        fontFamily: 'Roboto',
        fill: 'black'
      });

      num.x(i * (scale) + scale + scale / 2 - num.width() / 2 );
      num.y(scale / 2 - num.width() / 2);

      mainLayer.add(num);
    }

    // y axis numbers
    for(let i = 0; i < yLength; i++) {
      let str = decToBin(toGrayCode(i), yVars);
      
      let num = new Konva.Text({
        text: str,
        fontSize: scale / 3,
        fontFamily: 'Roboto',
        fill: 'black'
      });

      num.x(scale / 2 - num.width() / 2);
      num.y(i * scale + scale / 2 - num.height() / 2 + scale);

      mainLayer.add(num);
    }

    stage.add(mainLayer);
  }
}

/**
 * Draws every group onto the kmap
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cells
 * @param {Array.Cell} groups - array of cells
 */
function drawGroups(ctx, scale, groups) {
  let colors = chroma.scale(['#9c27b0', '#3f51b5', '#03a9f4', '#009688',
  '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

  for(let i = 0; i < groups.length; i++) {
    let rgb;

    for(let j = 0; j < groups[i].length; j++) {
      if(groups[i][j].pImp) {
        rgb = hexToRGB('#f44336', 0.7);
      } else {
        let color = colors.splice(Math.floor(Math.random() * colors.length - 1),
        1);
        rgb = hexToRGB(color[0], 0.5);
      }

      switch (groups[i][j].type) {
        case '2x2':
          draw2x2(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '2x4':
          draw2x4(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '1x2':
          draw1x2(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '1x4':
          draw1x4(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '2x1':
          draw2x1(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '4x1':
          draw4x1(ctx, scale, groups[i][j], rgb);
          continue;
          break;
        case '1x1':
          mark(ctx, scale, groups[i][j].cellArray[0].x, groups[i][j].cellArray[0].y, 0,
            rgb);
          continue;
          break;
        default:
          console.log('error: ' + groups[i][j].type);
          break;
      }

      for(let k = 0; k < groups[i][j].cellArray.length; k++) {
        mark(ctx, scale, groups[i][j].cellArray[k].x, groups[i][j].cellArray[k].y, 0,
          rgb);
      }
    }
    
  }
}

/**
 * Marks every cell with its current status
 * @param {Object} ctx - the context which you want to draw to
 * @param {number} scale - the scale of the cells
 * @param {Array.Cell} cells - array of cells
 */
function drawTerms(ctx, scale, cells) {

  for(let i = 0; i < cells.length; i ++) {
    for(let j = 0; j < cells[i].length; j++) {
      ctx.font = '20pt Roboto';
      ctx.fillText(cells[i][j].status, scale * (cells[i][j].x + 1) + scale / 2,
      scale * (cells[i][j].y + 1) + scale / 2);
      ctx.font = '10pt Roboto';
      ctx.fillText(cells[i][j].val, scale * (cells[i][j].x + 1) + scale / 4 * 3,
      scale * (cells[i][j].y + 1) + scale / 4 * 3);
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
function mark(ctx, scale, x, y, rotation, color) {
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
 * Converts a hex string to a rgba color string and returns it
 * @param {string} hex - hex string color
 * @param {string} alpha - opacity for the color
 * @return {string} converted rgba color
 */
function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
