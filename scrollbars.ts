import {InfiniteGrid} from './grid';

interface Rect {
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

class Scrollbars {
  scrollbarColor='hsl(0, 0%, 61%)'
  scrollbarBackground='hsl(0, 0%, 86%)'
  scrollButtColor ='hsl(0, 0%, 76%)'
  scrollButtSize = 30
  scrollHandleSize = 12
  scrollHandleMinLength = 90

  constructor(
    private ctx: CanvasRenderingContext2D,
    private grid: InfiniteGrid
  ) { }

  private getXBarRect():Rect {
    let ret = {
      startX: 0,
      startY: this.grid.dimensions.height - this.scrollButtSize,
    };

    (ret as Rect).endX = (ret.startX + this.grid.dimensions.width -
                          this.scrollButtSize);
    (ret as Rect).endY = (ret.startY + this.grid.dimensions.height -
                          this.scrollButtSize);

    return (ret as Rect);
  }

  private getYBarRect():Rect {
    let ret = {
      startX: this.grid.dimensions.width - this.scrollButtSize,
      startY: 0
    };

    (ret as Rect).endX = (ret.startX + this.grid.dimensions.width -
                          this.scrollButtSize);
    (ret as Rect).endY = (ret.startY + this.grid.dimensions.height -
                          this.scrollButtSize);

    return (ret as Rect)
  }

  private drawX(maxBounds:{x: number, y: number}) {
    let bounds = this.getXBarRect();
    this.ctx.fillStyle = this.scrollbarBackground;
    this.ctx.fillRect(
      bounds.startX,
      bounds.startY,
      bounds.endX - bounds.startX,
      bounds.endY - bounds.startY);

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
    let bounds = this.getYBarRect();
    this.ctx.fillStyle = this.scrollbarBackground;
    this.ctx.fillRect(
      bounds.startX,
      bounds.startY,
      bounds.endX - bounds.startX,
      bounds.endY - bounds.startY);

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
