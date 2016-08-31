import {XYPos} from './xypos'
import {Dimensions, InfiniteGrid} from './grid';

class Scrollbars {
  dimensions: Dimensions
  ctx: CanvasRenderingContext2D
  grid: InfiniteGrid
  viewportOffset: XYPos

  constructor(
    dimensions: Dimensions,
    ctx: CanvasRenderingContext2D,
    grid: InfiniteGrid,
    viewportOffset: XYPos
  ) {

    this.dimensions = dimensions;
    this.ctx = ctx;
    this.grid = grid;
  }

  draw(viewportOffset: XYPos) {
    this.viewportOffset = viewportOffset;

    var maxBounds = this.grid.getMaxBounds();
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, 30, this.dimensions.height);
    this.ctx.fillRect(0, this.dimensions.height - 30, this.dimensions.width, this.dimensions.height - 30);

    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(10,
                      this.viewportOffset.y / maxBounds.y * this.dimensions.height,
                      10,
                      this.viewportOffset.y / maxBounds.y * this.dimensions.height);

    this.ctx.fillRect(this.viewportOffset.x / maxBounds.x * this.dimensions.width,
                      this.dimensions.height - 15,
                      this.viewportOffset.x / maxBounds.x * this.dimensions.width,
                      this.dimensions.height - 15);
  }
};


export {Scrollbars}
