import {XYPos} from './xypos'
import {Scrollbars} from './scrollbars'

// https://github.com/Microsoft/TypeScript/issues/3429
interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
}

interface Dimensions {
  width: number,
  height: number,
  columnHeaderHeight: number,
  cellHeight: number,
  cellWidth: number,
  cellMargin: number,
  rowGuideWidth: number,
};

class InfiniteGrid {
  ctx: CanvasRenderingContext2D
  constantOffsets: XYPos
  dimensions: Dimensions
  debugInfo = {
    drawnColumnHeaders: 0,
    drawnCells: 0,
    drawnRowGuides: 0,
  };
  viewportOffset: XYPos
  debug: boolean
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private dataProvider: any
  private mouseOverPosition: XYPos
  private mouseOverTargets: {col: Number, row: Number}
  private scalar: number
  private oldScalar: number
  private cellRenderer
  private scrollbars: Scrollbars
  private rafId: number

  constructor(
    container: HTMLElement,
    dimensions: Dimensions,
    dataProvider,
    cellRenderer) {

      cellRenderer.grid = this;

      this.viewportOffset = new XYPos({x: 0, y: 0});
      this.constantOffsets = new XYPos({x: 0, y: 0});
      this.mouseOverTargets = {col: -1, row: -1};
      this.mouseOverPosition = new XYPos({x: -1, y: -1});

      this.scalar = 1;
      this.oldScalar = 1;

      this.container = container;
      this.dataProvider = dataProvider;
      this.dimensions = dimensions;

      this.constantOffsets.x += dimensions.rowGuideWidth;
      this.constantOffsets.y += dimensions.columnHeaderHeight;
      this.constantOffsets.syncState();

      this.cellRenderer = cellRenderer;
      this.setup(dimensions);
    }

    updateScalar(newScalar:number) {
      this.scalar = newScalar;
    }

    private setDimensions(dimensions:Dimensions) {
      this.canvas.setAttribute(
        'width',
        String(dimensions.width));

      this.canvas.setAttribute(
        'height',
        String(dimensions.height));

        this.canvas.style.width = `${dimensions.width / window.devicePixelRatio}px`;
        this.canvas.style.height = `${dimensions.height / window.devicePixelRatio}px`;
    }

    updateDimensions(dimensions:Dimensions) {
      this.setDimensions(dimensions)
      this.dimensions = dimensions
      this.render();
    }

    private setEventListeners() {
      (this.canvas.addEventListener as any)(
        'wheel',
        this.onMouseWheel.bind(this),
        {passive: true})

      this.canvas.addEventListener(
        'mousemove',
        this.onMouseMove.bind(this))

      this.canvas.addEventListener(
        'click',
        this.onClick.bind(this));

      window.addEventListener(
        'keydown',
        this.onKeyPress.bind(this))
    }

    private setup(dimensions:Dimensions) {
      this.canvas = document.createElement('canvas');
      this.setDimensions(dimensions)

      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);
      this.setEventListeners();
      this.scrollbars = new Scrollbars(
        this.ctx,
        this);

      window.setInterval(this.tick.bind(this), 16.66);
    }

    private onKeyPress(e:KeyboardEvent) {
      switch (e.key) {
        case 'ArrowDown':
          this.scrollDown()
        break;
        case 'ArrowUp':
          this.scrollUp()
        break;
        case 'ArrowRight':
          this.scrollRight()
        break;
        case 'ArrowLeft':
          this.scrollLeft()
        break;
        case ' ':
          this.pageDown()
        break;
        default:
          //noop
      }
    }

    private pageDown() {
      this.scrollDown(
        Math.floor(this.dimensions.height / this.getColumnOuterHeight()));
    }

    private scrollDown(by:number=1) {
      this.viewportOffset.y += (by * this.getColumnOuterHeight());
    }

    private scrollUp() {
      if (this.viewportOffset.y - this.getColumnOuterHeight() < 0) {
        this.viewportOffset.y = 0;
        return;
      }

      this.viewportOffset.y -= this.getColumnOuterHeight();
    }

    private scrollLeft() {
      if (this.viewportOffset.x - this.getColumnOuterHeight() < 0) {
        this.viewportOffset.x = 0;
        return;
      }

      this.viewportOffset.x -= this.getColumnOuterWidth();
    }

    private scrollRight() {
      this.viewportOffset.x += this.getColumnOuterWidth();
    }

    private isOverRowGuide(x: number, y:number):boolean {
      return x <= this.s(this.dimensions.rowGuideWidth)
    }

    private isOverColumnHeader(x: number, y:number):boolean {
      return y <= this.s(this.dimensions.columnHeaderHeight);
    }

    private onClick(e:MouseEvent) {
      const x = e.layerX * window.devicePixelRatio;
      const y = e.layerY * window.devicePixelRatio;

      if (this.scrollbars.isOver(x, y)) {
        this.scrollbars.handleClick(x, y);
        return
      }

      if (this.isOverRowGuide(x, y)) {
        return
      }

      if (this.isOverColumnHeader(x, y)) {
        return
      }

      const coors = this.getCellFromXY(x, y);

      if (this.cellRenderer.isCellAtCoorsVisible(coors.row, coors.col, this)) {
        console.log(coors);
      }
    }

    private onMouseMove(e:MouseEvent) {
      this.mouseOverPosition.x = e.clientX * window.devicePixelRatio;
      this.mouseOverPosition.y = e.clientY * window.devicePixelRatio;
    }

    private getCellFromXY(
      x: number = 0,
      y: number = 0,
      roundFn: (x:number) => number = Math.floor):{row:number, col:number} {
      let xWithOffset = x + this.viewportOffset.x;
      let yWithOffset = y + this.viewportOffset.y;

      return {
        col: roundFn(
          (xWithOffset - this.s(this.constantOffsets.x)) / this.getColumnOuterWidth()),
        row: roundFn((
          yWithOffset - this.s(this.constantOffsets.y)) / this.getColumnOuterHeight())
      }
    }

    private calculateMouseOverTargets() {
      const position = this.getCellFromXY(
        this.mouseOverPosition.x,
        this.mouseOverPosition.y);

      this.mouseOverTargets = position;
    }

    getMaxBounds(): {x: number, y: number} {
      return {
        x: (this.s(this.constantOffsets.x) +
          this.getColumnOuterWidth() * this.dataProvider.columns.count),
        y: (this.s(this.constantOffsets.y) +
            this.getColumnOuterHeight() * this.dataProvider.rows.length),
      };
    }

    private onMouseWheel(e:WheelEvent) {
      let {deltaY, deltaX} = e;
      let dirty = {x: false, y: false};

      let maxBounds = this.getMaxBounds();

      if (this.viewportOffset.x + deltaX < 0) {
        this.viewportOffset.x = 0;
        dirty.x = true;
      }

      if (this.viewportOffset.y + deltaY < 0) {
        this.viewportOffset.y = 0;
        dirty.y = true;
      }

      if (this.viewportOffset.x + deltaX + this.dimensions.width > maxBounds.x) {
        this.viewportOffset.x = maxBounds.x - this.dimensions.width;
        dirty.x = true;
      }

      if (this.viewportOffset.y + deltaY + this.dimensions.height > maxBounds.y) {
        this.viewportOffset.y = maxBounds.y - this.dimensions.height;
        dirty.y = true;
      }

      if (!dirty.x) {
        this.viewportOffset.x += deltaX;
      }

      if (!dirty.y) {
        this.viewportOffset.y += deltaY;
      }
    }

    private tick() {
      if (this.rafId != undefined) {
        return;
      }

      this.rafId = window.requestAnimationFrame(
        this.renderLoop.bind(this));
    }

    private renderLoop() {
      this.rafId = undefined;

      if (this.invalidated()) {
        this.calculateMouseOverTargets();
        this.viewportOffset.syncState();
        this.mouseOverPosition.syncState();
        this.oldScalar = this.scalar;

        this.render();
      }
    }

    private invalidated():boolean {
      return (
          this.viewportOffset.invalidated() ||
          this.mouseOverPosition.invalidated() ||
          this.scalar !== this.oldScalar);
    }

    renderColumnHeaders(startRowIndex:number, endRowIndex:number) {
      this.ctx.fillStyle = 'hsl(232, 54%, 41%)';
      this.ctx.fillRect(
        this.s(this.constantOffsets.x),
        0,
        this.dimensions.width,
        this.s(this.dimensions.columnHeaderHeight));

      for(let i = startRowIndex; i < endRowIndex; ++i) {
        this.drawColumnHeader(i);
      }

      this.ctx.fillStyle = 'hsl(0, 0%, 76%)';
      this.ctx.fillRect(
        0,
        0,
        this.s(this.dimensions.rowGuideWidth),
        this.s(this.dimensions.columnHeaderHeight));
    }

    renderRowGuide(rowIndex:number) {
      let topY = this.s(this.dimensions.columnHeaderHeight) +
        this.s(((1 + rowIndex) * this.dimensions.cellMargin) +
               rowIndex * this.dimensions.cellHeight);

      if (!this.isInViewport(
        this.viewportOffset.x,
        topY - this.s(this.dimensions.columnHeaderHeight),
        this.s(this.dimensions.rowGuideWidth),
        this.s(this.dimensions.cellHeight))) {
        return;
      }

      if (this.debug) {
        this.debugInfo.drawnRowGuides++;
      }

      this.ctx.fillStyle = 'hsl(231, 48%, 48%)';
      this.ctx.fillRect(
        0,
        topY - this.viewportOffset.y,
        this.s(this.dimensions.rowGuideWidth),
        this.s(this.dimensions.cellHeight));

      this.ctx.fillStyle = 'hsl(187, 72%, 93%)';
      this.drawText(
          this.s(20),
          this.s(10),
          topY - this.viewportOffset.y + this.s(50),
          `row ${rowIndex}`)
    }

    render() {
      this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

      if (this.debug)
        this.debugInfo.drawnRowGuides = this.debugInfo.drawnCells = this.debugInfo.drawnColumnHeaders = 0;

      const startingPosition = this.getCellFromXY(
        this.s(this.constantOffsets.x),
        this.s(this.constantOffsets.y));

      const endingPosition = this.getCellFromXY(
        this.dimensions.width,
        this.dimensions.height,
        Math.ceil);

      const startRowIndex = Math.max(0, startingPosition.row);
      const endRowIndex = Math.max(0, endingPosition.row);
      const startColIndex = Math.max(0, startingPosition.col);
      const endColIndex = Math.min(
        this.dataProvider.columns.count,
        Math.max(0, endingPosition.col));


       for (var rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
        const row = this.dataProvider.rows[rowIndex];
        if (!row) break;

        for (var columnIndex = startColIndex; columnIndex < endColIndex; columnIndex++) {
          const cell = row.columns[columnIndex];
          if (!cell) break;

          let cellCoords = this.cellRenderer.getCellDrawCoords(rowIndex, columnIndex);

          this.cellRenderer.drawCell(
            cellCoords.topY - this.viewportOffset.y,
            cellCoords.leftX - this.viewportOffset.x,
            rowIndex,
            columnIndex,
            cell);

        }

        this.renderRowGuide(rowIndex);
      }

      this.renderColumnHeaders(startColIndex, endColIndex);
      this.scrollbars.draw();

      this.debug && console.debug(JSON.stringify(this.debugInfo));
    }

    isInViewport(
      leftX:number,
      topY:number,
      width:number,
      height:number):Boolean {

        let viewportBounds = {
          minX: this.viewportOffset.x,
          maxX: this.dimensions.width + this.viewportOffset.x,
          minY: this.viewportOffset.y,
          maxY: this.dimensions.height + this.viewportOffset.y
        };

        if (topY > viewportBounds.maxY) {
          return false;
        }

        if (topY + height < viewportBounds.minY) {
          return false;
        }

        if (leftX + width > viewportBounds.minX &&
            leftX + width < viewportBounds.maxX) {
          return true;
        }

        if (leftX < viewportBounds.maxX && leftX > viewportBounds.minX) {
          return true;
        }


        return false;
      }

      private drawColumnHeader(columnIndex:number) {
        let leftX = this.s(this.constantOffsets.x) +
          this.s(((1 + columnIndex) * this.dimensions.cellMargin) +
                 columnIndex * this.dimensions.cellWidth);

        let topY = 0
        let innerWidth = this.s(this.dimensions.cellWidth);
        let innerHeight = this.s(this.dimensions.columnHeaderHeight);

        if (!this.isInViewport(
          leftX,
        topY + this.viewportOffset.y,
        innerWidth,
        innerHeight)) {
          return;
        }

        this.debug && this.debugInfo.drawnColumnHeaders++;

        this.ctx.fillStyle = 'hsl(235, 66%, 30%)';
        this.ctx.fillRect(
          leftX - this.viewportOffset.x,
          topY,
          innerWidth,
          innerHeight);

        this.ctx.fillStyle = 'white';
        this.drawText(
          this.s(12),
          leftX - this.viewportOffset.x,
          topY + innerHeight / 2,
          `column ${columnIndex}`)
      }

      private getColumnOuterWidth() {
        return this.s(this.dimensions.cellMargin + this.dimensions.cellWidth);
      }

      private getColumnOuterHeight() {
        return this.s(this.dimensions.cellMargin + this.dimensions.cellHeight);
      }

      isRowHovered(row:number):boolean {
        return this.mouseOverTargets.row === row;
      }

      isColumnHovered(col:number):boolean {
        return this.mouseOverTargets.col === col;
      }

      isHovered(row:number, col:number):boolean {
        return this.isRowHovered(row) && this.isColumnHovered(col);
      }

      s(val:number):number {
        return val * this.scalar;
      }

      drawText(
        fontSize:number,
        x:number,
        y:number,
        text:string) {

          // No need to draw text less than 4px
          if (fontSize < 5) {
            return;
          }

          const padding = this.s(5);

          this.ctx.font = `bold ${fontSize}px Roboto`
          this.ctx.fillText(text, x + padding, y + padding);
        }
}

export {InfiniteGrid, Dimensions}
