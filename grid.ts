import {MouseState} from './mousestate'
import {XYPos} from './xypos'
import {Scrollbars} from './scrollbars'
import {DataProvider, Column} from './types'

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
  mouseState: MouseState
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private dataProvider: DataProvider
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
      this.mouseState = new MouseState({
        mouseDown: false,
        mouseOver: false,
        mouseOffViewport: true
      });

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

    setFrameSize(width: number, height:number) {
      this.dimensions.width = width;
      this.dimensions.height = height;

      this.canvas.setAttribute(
        'width',
        String(width));

      this.canvas.setAttribute(
        'height',
        String(height));

      this.canvas.style.width = `${width / window.devicePixelRatio}px`;
      this.canvas.style.height = `${height / window.devicePixelRatio}px`;

      if (this.viewportOffset.x || this.viewportOffset.y) {
        this.scrollByPixels(0, 0);
      }
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
        'mousedown',
        this.onMouseDown.bind(this));

      this.canvas.addEventListener(
        'mouseenter',
        this.onMouseEnter.bind(this));

      this.canvas.addEventListener(
        'mouseleave',
        this.onMouseLeave.bind(this));

      this.canvas.addEventListener(
        'mouseup',
        this.onMouseUp.bind(this));

      this.canvas.addEventListener(
        'click',
        this.onClick.bind(this));

      window.addEventListener(
        'keydown',
        this.onKeyPress.bind(this))
    }

    private setup(dimensions:Dimensions) {
      this.canvas = document.createElement('canvas');
      this.setFrameSize(dimensions.width, dimensions.height);

      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);
      this.setEventListeners();
      this.scrollbars = new Scrollbars(
        this.ctx,
        this);

      window.setInterval(this.tick.bind(this), 16.66);
    }

    private onMouseEnter(e:MouseEvent) {
      this.mouseState.mouseOver = true;
    }

    private onMouseLeave(e:MouseEvent) {
      this.mouseState.mouseOver = false;
      this.mouseState.mouseDown = false;
      this.scrollbars.resetDragging();
    }

    private onMouseDown(e:MouseEvent) {
      this.mouseState.mouseDown = true;
    }

    private onMouseUp(e:MouseEvent) {
      this.mouseState.mouseDown = false;
      this.scrollbars.resetDragging();
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
      this.scrollByPixels(0, (by * this.getColumnOuterHeight()));
    }

    scrollByPixels(x: number, y:number) {
      let maxBounds = this.getMaxBounds();
      let xScrollable = this.scrollbars.isXBarVisible(maxBounds);
      let yScrollable = this.scrollbars.isYBarVisible(maxBounds);

      let nextXEdge = this.viewportOffset.x + x + this.dimensions.width
      let nextYEdge = this.viewportOffset.y + y + this.dimensions.height
      let nextYOffset = this.viewportOffset.y + y;
      let nextXOffset = this.viewportOffset.x + x;

      if (xScrollable && nextXEdge <= maxBounds.x && nextYOffset >= 0) {
        this.viewportOffset.x += x;
      }

      if (xScrollable && nextXEdge > maxBounds.x) {
        this.viewportOffset.x = Math.max(
          0,
          maxBounds.x - this.dimensions.width);
      }

      if (yScrollable && nextYEdge <= maxBounds.y && nextYOffset >= 0) {
        this.viewportOffset.y += y;
      }

      if (yScrollable && nextYEdge > maxBounds.y) {
        this.viewportOffset.y = Math.max(
          0,
          maxBounds.y - this.dimensions.height);
      }

      if (nextYOffset < 0) {
        this.viewportOffset.y = 0;
      }

      if (nextXOffset < 0) {
        this.viewportOffset.x = 0;
      }
    }

    private scrollUp() {
      this.scrollByPixels(0, -this.getColumnOuterHeight());
    }

    private scrollLeft() {
      this.scrollByPixels(-this.getColumnOuterWidth(), 0);
    }

    private scrollRight() {
      this.scrollByPixels(this.getColumnOuterWidth(), 0);
    }

    private isOverRowGuide(x: number, y:number):boolean {
      return x - this.viewportOffset.x <= this.s(this.dimensions.rowGuideWidth)
    }

    private isOverColumnHeader(x: number, y:number):boolean {
      return y - this.viewportOffset.y <= this.s(this.dimensions.columnHeaderHeight);
    }

    private onClick(e:MouseEvent) {
      const maxBounds = this.getMaxBounds();
      const localXY = this.convertWorldToGridXY(
        e.layerX * window.devicePixelRatio,
        e.layerY * window.devicePixelRatio);

      if (this.scrollbars.isOver(localXY.x, localXY.y)) {
        this.scrollbars.handleClick(localXY.x, localXY.y);
        return
      }

      if (this.isOverRowGuide(localXY.x, localXY.y)) {
        return
      }

      if (this.isOverColumnHeader(localXY.x, localXY.y)) {
        return
      }

      const coors = this.getCellFromXY(localXY.x, localXY.y);

      if (this.isValidCell(coors.col, coors.row)) {
        console.log(coors);
      }
    }

    private isValidCell(col: number, row: number) {
      return row < this.dataProvider.rows.length &&
        col < this.getColumnCount();
    }

    private onMouseMove(e: MouseEvent) {
      let localXY = this.convertWorldToGridXY(
        e.layerX * window.devicePixelRatio,
        e.layerY * window.devicePixelRatio);
      this.mouseOverPosition.x = localXY.x;
      this.mouseOverPosition.y = localXY.y;

      if (this.mouseState.mouseDown) {
        this.scrollbars.handleClick(localXY.x, localXY.y);
        return
      }

      let maxBounds = this.getMaxBounds();
      this.mouseState.mouseOffViewport = localXY.x > maxBounds.x || localXY.y > maxBounds.y
    }

    private getCellFromXY(
      x: number = 0,
      y: number = 0,
      roundFn: (x:number) => number = Math.floor):{row:number, col:number} {

      return {
        col: roundFn(
          (x - this.s(this.constantOffsets.x)) / this.getColumnOuterWidth()),
        row: roundFn(
          (y - this.s(this.constantOffsets.y)) / this.getColumnOuterHeight())
      }
    }

    private getColumnCount(): number {
      return Object.keys(this.dataProvider.rowColumnToColumnGroup).length;
    }

    private calculateMouseOverTargets() {
      const position = this.getCellFromXY(
        this.mouseOverPosition.x,
        this.mouseOverPosition.y);

      this.mouseOverTargets = position;
    }

    getMaxBounds(): {x: number, y: number} {
      let ret = {
        x: (this.s(this.constantOffsets.x) +
          this.getColumnOuterWidth() * this.getColumnCount()),
        y: (this.s(this.constantOffsets.y) +
            this.getColumnOuterHeight() * (this.dataProvider.rows.length)),
      };

      if (this.scrollbars.isXBarVisible(ret)) {
        ret.x += this.scrollbars.scrollButtSize;
      }

      if (this.scrollbars.isYBarVisible(ret)) {
        ret.y += this.scrollbars.scrollButtSize;
      }

      return ret;
    }

    private onMouseWheel(e:WheelEvent) {
      this.scrollByPixels(e.deltaX, e.deltaY);
      let localXY = this.convertWorldToGridXY(
        e.layerX * window.devicePixelRatio,
        e.layerY * window.devicePixelRatio);

      this.mouseOverPosition.x = localXY.x;
      this.mouseOverPosition.y = localXY.y;
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
        this.mouseState.syncState();
        this.oldScalar = this.scalar;
        this.render();
      }
    }

    private invalidated():boolean {
      return (this.mouseState.invalidated() ||
          this.viewportOffset.invalidated() ||
          this.mouseOverPosition.invalidated() ||
          this.scalar !== this.oldScalar);
    }

    renderColumnHeaders(startRowIndex: number, endRowIndex: number) {
      // Column header background fill.
      this.ctx.fillStyle = 'hsl(232, 54%, 41%)';
      this.ctx.fillRect(
        this.s(this.constantOffsets.x),
        0,
        this.dimensions.width,
        this.s(this.dimensions.columnHeaderHeight));

      for(let i = startRowIndex; i < endRowIndex; ++i) {
        this.drawColumnHeader(i);
      }

      // Left gutter fill.
      this.ctx.fillStyle = 'hsl(0, 0%, 76%)';
      this.ctx.fillRect(
        0,
        0,
        this.s(this.dimensions.rowGuideWidth),
        this.s(this.dimensions.columnHeaderHeight));
    }

    private getColumnFromRowColumn(rowColumnIndex: number): Column {
      return this.dataProvider.columns[
        this.dataProvider.rowColumnToColumnGroup[rowColumnIndex]];
    }

    private calculateColumnRowWidth(rowColumnIndex: number): number {
      const column = this.getColumnFromRowColumn(rowColumnIndex);
      return column.end - column.start;
    }

    private drawColumnHeader(rowColumnIndex: number) {
      let column = this.getColumnFromRowColumn(rowColumnIndex);

      let leftX = this.s(((1 + column.start) * this.dimensions.cellMargin) +
                         column.start * this.dimensions.cellWidth +
                         this.constantOffsets.x);

      let topY = 0
      let columnWidth = this.calculateColumnRowWidth(rowColumnIndex);
      let innerWidth = this.s(
        (this.dimensions.cellWidth * columnWidth) +
        (this.dimensions.cellMargin * (columnWidth - 1)));
      let innerHeight = this.s(this.dimensions.columnHeaderHeight);

      if (!this.isInViewport(
        leftX, topY + this.viewportOffset.y, innerWidth, innerHeight)) {
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
        `column ${column.start}`)
    }

    convertWorldToGridXY(x: number, y: number):{x: number, y: number} {
      return {
        x: x + this.viewportOffset.x,
        y: y + this.viewportOffset.y,
      }
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

      let startingXY = this.convertWorldToGridXY(
        this.s(this.constantOffsets.x),
        this.s(this.constantOffsets.y));

      const startingPosition = this.getCellFromXY(
        startingXY.x,
        startingXY.y);

      let endXY = this.convertWorldToGridXY(this.dimensions.width, this.dimensions.height);

      const endingPosition = this.getCellFromXY(
        endXY.x,
        endXY.y,
        Math.ceil);

      const startRowIndex = Math.max(0, startingPosition.row);
      const endRowIndex = Math.max(0, endingPosition.row);
      const startColIndex = Math.max(0, startingPosition.col);
      const endColIndex = Math.min(
        this.getColumnCount(),
        Math.max(0, endingPosition.col));


       for (var rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
        const row = this.dataProvider.rows[rowIndex];
        if (!row) break;

        for (var columnIndex = startColIndex; columnIndex < endColIndex; columnIndex++) {
          const cell = row[columnIndex];
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

      private getColumnOuterWidth() {
        return this.s(this.dimensions.cellMargin + this.dimensions.cellWidth);
      }

      private getColumnOuterHeight() {
        return this.s(this.dimensions.cellMargin + this.dimensions.cellHeight);
      }

      private mouseOverGridContent():boolean {
        let mouseX = this.mouseOverPosition.x;
        let mouseY = this.mouseOverPosition.y;

        return this.mouseState.mouseOver &&
          !this.mouseState.mouseOffViewport &&
          !this.isOverColumnHeader(mouseX, mouseY) &&
          !this.isOverRowGuide(mouseX, mouseY) &&
          !this.scrollbars.isOver(mouseX, mouseY);
      }

      isRowHovered(row:number):boolean {
        return this.mouseOverGridContent() && this.mouseOverTargets.row === row;
      }

      isColumnHovered(col:number):boolean {
        return this.mouseOverGridContent() && this.mouseOverTargets.col === col;
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
