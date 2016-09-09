import {InfiniteGrid} from './grid';

interface Rect {
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

class Scrollbars {
  scrollbarColor = 'hsl(0, 0%, 61%)'
  scrollbarBackground = 'hsl(0, 0%, 86%)'
  scrollButtColor = 'hsl(0, 0%, 76%)'
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

    (ret as Rect).endX = (ret.startX + this.scrollButtSize);
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

    let xScrollPercent = (this.grid.viewportOffset.x /
                          (maxBounds.x - this.grid.dimensions.width));

    this.ctx.fillStyle = this.scrollbarColor;

    this.ctx.fillRect(
      xScrollPercent * (this.grid.dimensions.width - width),
      (this.grid.dimensions.height -
       this.scrollButtSize + this.scrollButtSize / 2 -
       this.scrollHandleSize / 2),
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
      (this.grid.dimensions.height
       / maxBounds.y) * this.grid.dimensions.height);

    let yScrollPercent = (this.grid.viewportOffset.y /
                          (maxBounds.y - this.grid.dimensions.height));

    this.ctx.fillStyle = this.scrollbarColor;

    this.ctx.fillRect(
      (this.grid.dimensions.width -
       this.scrollButtSize + this.scrollButtSize / 2 -
       this.scrollHandleSize / 2),
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

  private isPointInRect(x:number, y:number, rect:Rect):Boolean {
    return (x >= rect.startX && x <= rect.endX) &&
      (y >= rect.startY && y <= rect.endY);
  }

  private handleXClick(x: number) {
    this.grid.viewportOffset.x = (this.grid.getMaxBounds().x -
                                  this.grid.dimensions.width) * (
    x / (this.grid.dimensions.width - this.scrollButtSize));
  }

  private handleYClick(y: number) {
    this.grid.viewportOffset.y = (this.grid.getMaxBounds().y -
                                  this.grid.dimensions.height) * (
    y / (this.grid.dimensions.height - this.scrollButtSize));
  }

  draw() {
    var maxBounds = this.grid.getMaxBounds();

    if (this.isXBarVisible(maxBounds)) {
      this.drawX(maxBounds);
    }

    if (this.isYBarVisible(maxBounds)) {
      this.drawY(maxBounds);
    }

    if (this.isXBarVisible(maxBounds) || this.isYBarVisible(maxBounds)) {
      this.drawScrollButt();
    }
  }

  isOver(x:number, y:number): Boolean {
    return this.isPointInRect(x, y, this.getYBarRect()) ||
      this.isPointInRect(x, y, this.getXBarRect());
  }

  handleClick(x:number, y:number) {
    if (this.isPointInRect(x, y, this.getYBarRect())) {
      this.handleYClick(y);
    }

    if (this.isPointInRect(x, y, this.getXBarRect())) {
      this.handleXClick(x);
    }
  }

  isXBarVisible(maxBounds): Boolean {
    return this.grid.viewportOffset.x > 0 ||
      maxBounds.x > this.grid.dimensions.width;
  }

  isYBarVisible(maxBounds): Boolean {
    return this.grid.viewportOffset.y > 0 ||
      maxBounds.y > this.grid.dimensions.height;
  }
};

export {Scrollbars}
