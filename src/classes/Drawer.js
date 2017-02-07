class Drawer {
  // takes an array of points
  constructor(points) {
    this.points = points;
  }

  drawPoints() {
    for(let i = 0; i < this.points.length; i++) {
      let color = this.randomRGB();
      for(let j = 0; j < this.points[i].length; j++) {
        this.mark(this.points[i][j].x, this.points[i][j].y, 0, color);
      }
    }
  }

  //draws a color on the matching cell
  mark(x, y, rotation, color) {
    console.log("hello");
    // saves current context state
    ctx.save();

    // translates the origin of the context
    ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
    // rotates around the origin
    ctx.rotate(rotation * Math.PI / 180);

    //draws match color
    ctx.beginPath();

    ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+",0.3)";
    // subtracts to center the match color
    ctx.fillRect(-scale / 2, -scale / 2, scale, scale /*- 10*/);
    ctx.fillStyle = '#000';

    ctx.restore();
  }

  randomRGB() {
    var red = Math.floor(Math.random() * 256);
    var green = Math.floor(Math.random() * 256);
    var blue = Math.floor(Math.random() * 256);

    return [red, green, blue];
  }
}
