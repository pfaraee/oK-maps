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

    let vars = this.vars; // added so i can type less
    let stage = this.stage;
    let scale = this.calculateScale(stage.width(), vars);


    // amount of vars for each Axis
    let xVars = vars - Math.floor(vars / 2) - (vars % 2);
    let yVars = vars - Math.floor(vars / 2);

    // cell length for each Axis
    let xLength = Math.pow(2, xVars);
    let yLength = Math.pow(2, yVars);

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

    this.stage.add(mainLayer);
  }

  /**
   * Marks every cell with its current status
   * @param {Object} ctx - the context which you want to draw to
   * @param {number} scale - the scale of the cells
   * @param {Array.Cell} cells - array of cells
   */
  drawTerms(cells) {
    let scale = this.calculateScale(this.stage.width(), this.vars);
    let termLayer = new Konva.Layer();

    for(let i = 0; i < cells.length; i ++) {
      for(let j = 0; j < cells[i].length; j++) {
        let term = new Konva.Text({
          text: cells[i][j].status,
          fontSize: scale / 3,
          fontFamily: 'Roboto',
          fill: 'black'
        });
        term.x(i * scale + scale/2 - term.width()/2 + scale);
        term.y(j * scale + scale/2 - term.height()/2 + scale);        
        
        termLayer.add(term);
        // ctx.font = '10pt Roboto';
        // ctx.fillText(cells[i][j].val, scale * (cells[i][j].x + 1) + scale / 4 * 3,
        // scale * (cells[i][j].y + 1) + scale / 4 * 3);
      }
    }

    this.stage.add(termLayer);
  }

  /**
   * Marks a cell completely
   * @param {number} x - the x coord of the cell
   * @param {number} y - the y coord of the cell
   * @param {string} color - the color of the cell
   * @return {Rect} - Konva rect
   */
  mark(x, y, color) {
    let scale = this.calculateScale(this.stage.width(), this.vars);
    let rect = new Konva.Rect({
      x: x * (scale) + scale ,
      y: y * (scale) + scale ,
      width: scale ,
      height: scale ,
      fill: color,
      strokeWidth: 1
    });
    console.log(rect.x());
    return rect;
  }

  /**
   * Draws every group onto the kmap
   * @param {Array.Cell} groups - array of cells
   */
  drawGroups(groups) {
    let colors = chroma.scale(['#9c27b0', '#3f51b5', '#03a9f4', '#009688',
    '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

    let groupLayer = new Konva.Layer();

    for(let i = 0; i < groups.length; i++) {
      for(let j = 0; j < groups[i].length; j++) {
        let rgb;

        if(groups[i][j].pImp) {
          rgb = this.hexToRGB('#f44336', 0.7);
        } else {
          let color = colors.splice(Math.floor(Math.random() * colors.length - 1),
          1);
          rgb = this.hexToRGB(color[0], 0.5);
        }
        console.log(groups[i][j].cellArray);
        for(let k = 0; k < groups[i][j].cellArray.length; k++) {
          let rect = this.mark(groups[i][j].cellArray[k].x, groups[i][j].cellArray[k].y, rgb);
          console.log(rect);
          groupLayer.add(rect);
        }
      }
    }
    console.log(groupLayer);
    this.stage.add(groupLayer);
  }

  /**
   * Converts a hex string to a rgba color string and returns it
   * @param {string} hex - hex string color
   * @param {string} alpha - opacity for the color
   * @return {string} converted rgba color
   */
  hexToRGB(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }
}


