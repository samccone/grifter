import {InfiniteGrid} from './grid';

interface Rect {
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

class Scrollbars {
  private draggingX: Boolean = false
  private draggingY: Boolean = false
  scrollbarColor = 'hsl(0, 0%, 61%)'
  scrollbarBackground = 'hsl(0, 0%, 86%)'
  scrollButtColor = 'hsl(0, 0%, 76%)'
  scrollButtSize = 30
  scrollHandleSize = 12
  scrollHandleMinLength = 90
  constructor(
    private ctx: CanvasRenderingContext2D,
    private grid: InfiniteGrid
  ) {
    this.scrollButtSize = this.scrollButtSize * window.devicePixelRatio;
    this.scrollHandleSize = this.scrollHandleSize * window.devicePixelRatio;
    this.scrollHandleMinLength = this.scrollHandleMinLength * window.devicePixelRatio;
  }

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

  private isDragging(): Boolean {
    return this.draggingX || this.draggingY;
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
    let maxBounds = this.grid.getMaxBounds();
    let nextXOffset = (maxBounds.x - this.grid.dimensions.width) * (
    this.removeXViewportOffset(x) / (this.grid.dimensions.width - this.scrollButtSize));

    this.grid.scrollByPixels(nextXOffset - this.grid.viewportOffset.x, 0);
  }

  private handleYClick(y: number) {
    let maxBounds = this.grid.getMaxBounds();
    let nextYOffset = (maxBounds.y - this.grid.dimensions.height) * (
      this.removeYViewportOffset(y) / (this.grid.dimensions.height - this.scrollButtSize));

    this.grid.scrollByPixels(0, nextYOffset - this.grid.viewportOffset.y);
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

  private removeXViewportOffset(x: number): number {
    return x - this.grid.viewportOffset.x;
  }

  private removeYViewportOffset(y: number): number {
    return y - this.grid.viewportOffset.y;
  }

  private isOverX(x: number, y: number): Boolean {
    let maxBounds = this.grid.getMaxBounds();

    return this.isXBarVisible(maxBounds) &&
      this.isPointInRect(this.removeXViewportOffset(x), this.removeYViewportOffset(y), this.getXBarRect());
  }

  private isOverY(x: number, y: number): Boolean {
    let maxBounds = this.grid.getMaxBounds();

    return this.isYBarVisible(maxBounds) &&
      this.isPointInRect(this.removeXViewportOffset(x), this.removeYViewportOffset(y), this.getYBarRect());
  }

  isOver(x:number, y:number): Boolean {
    return this.isOverX(x, y) || this.isOverY(x, y);
  }

  resetDragging() {
    this.draggingX = false;
    this.draggingY = false;
  }

  handleClick(x:number, y:number) {
    let maxBounds = this.grid.getMaxBounds();

    if (this.draggingY || this.isOverY(x, y)) {
      this.resetDragging();
      this.draggingY = true;
      this.handleYClick(y);
      return
    }

    if (this.draggingX || this.isOverX(x, y)) {
      this.resetDragging();
      this.draggingX = true;
      this.handleXClick(x);
      return
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
