import {XYPos} from './xypos'
import {Dimensions, InfiniteGrid} from './grid';

class Scrollbars {
  ctx: CanvasRenderingContext2D
  grid: InfiniteGrid

  constructor(
    ctx: CanvasRenderingContext2D,
    grid: InfiniteGrid
  ) {

    this.ctx = ctx;
    this.grid = grid;
  }

  draw() {
    var maxBounds = this.grid.getMaxBounds();
    this.ctx.fillStyle = 'hsl(0, 0%, 86%)';
    this.ctx.fillRect(
        this.grid.dimensions.width - 30,
        0,
        this.grid.dimensions.width,
        this.grid.dimensions.height);

    this.ctx.fillRect(
      0,
      this.grid.dimensions.height - 30,
      this.grid.dimensions.width,
      this.grid.dimensions.height - 30);

    let yScrollPercent = this.grid.viewportOffset.y /
      (maxBounds.y - this.grid.dimensions.height);

    let xScrollPercent = this.grid.viewportOffset.x /
      (maxBounds.x - this.grid.dimensions.width);

    this.ctx.fillStyle = 'hsl(0, 0%, 61%)';
    this.ctx.fillRect(this.grid.dimensions.width - 30 + 10,
                      yScrollPercent * this.grid.dimensions.height,
                      10,
                      (this.grid.dimensions.height / maxBounds.y) * this.grid.dimensions.height);

    this.ctx.fillRect(xScrollPercent * this.grid.dimensions.width,
                      this.grid.dimensions.height - 15,
                      (this.grid.dimensions.width / maxBounds.x) * this.grid.dimensions.width,
                      5);
  }
};


export {Scrollbars}
