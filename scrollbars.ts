import {InfiniteGrid} from './grid';

class Scrollbars {
  ctx: CanvasRenderingContext2D
  grid: InfiniteGrid

  scrollbarColor='hsl(0, 0%, 61%)'
  scrollbarBackground='hsl(0, 0%, 86%)'
  scrollButtColor ='hsl(0, 0%, 76%)'
  scrollButtSize = 30
  scrollHandleSize = 12
  scrollHandleMinLength = 90

  constructor(
    ctx: CanvasRenderingContext2D,
    grid: InfiniteGrid
  ) {

    this.ctx = ctx;
    this.grid = grid;
  }

  private drawX(maxBounds:{x: number, y: number}) {
    this.ctx.fillStyle = this.scrollbarBackground;
    this.ctx.fillRect(
      0,
      this.grid.dimensions.height - this.scrollButtSize,
      this.grid.dimensions.width - this.scrollButtSize,
      this.grid.dimensions.height - this.scrollButtSize);

    let width = Math.max(
      this.scrollHandleMinLength,
      (this.grid.dimensions.width / maxBounds.x) * this.grid.dimensions.width);

    let xScrollPercent = this.grid.viewportOffset.x / (maxBounds.x - this.grid.dimensions.width);

    this.ctx.fillStyle = this.scrollbarColor;

    this.ctx.fillRect(
      xScrollPercent * (this.grid.dimensions.width - width),
      this.grid.dimensions.height - this.scrollButtSize + this.scrollButtSize / 2 - this.scrollHandleSize / 2,
      width - this.scrollButtSize,
      this.scrollHandleSize);
  }

  private drawY(maxBounds:{x: number, y: number}) {
    this.ctx.fillStyle = this.scrollbarBackground;

    this.ctx.fillRect(
        this.grid.dimensions.width - this.scrollButtSize,
        0,
        this.grid.dimensions.width - this.scrollButtSize,
        this.grid.dimensions.height - this.scrollButtSize);

    let height = Math.max(
      this.scrollHandleMinLength,
      (this.grid.dimensions.height / maxBounds.y) * this.grid.dimensions.height);

    let yScrollPercent = this.grid.viewportOffset.y / (maxBounds.y - this.grid.dimensions.height);

    this.ctx.fillStyle = this.scrollbarColor;

    this.ctx.fillRect(
      this.grid.dimensions.width - this.scrollButtSize + this.scrollButtSize / 2 - this.scrollHandleSize / 2,
      yScrollPercent * (this.grid.dimensions.height - height),
      this.scrollHandleSize,
      height - this.scrollButtSize);
  }

  private drawScrollButt() {
    this.ctx.fillStyle = this.scrollButtColor;
    this.ctx.fillRect(
        this.grid.dimensions.width - this.scrollButtSize,
        this.grid.dimensions.height - this.scrollButtSize,
        this.scrollButtSize,
        this.scrollButtSize);
  }


  draw() {
    var maxBounds = this.grid.getMaxBounds();

    if (maxBounds.x > this.grid.dimensions.width) {
      this.drawX(maxBounds);
    }

    if (maxBounds.y > this.grid.dimensions.height) {
      this.drawY(maxBounds);
    }

    this.drawScrollButt();
  }
};


export {Scrollbars}
