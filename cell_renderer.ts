import {InfiniteGrid} from './grid'

class CellRenderer {
  grid: InfiniteGrid;

  private getColumnFillColor(
    rowIndex:number,
    colIndex:number):string {

      if (this.grid.isHovered(rowIndex, colIndex)) {
        return 'grey';
      }

      if (this.grid.isColumnHovered(colIndex) || this.grid.isRowHovered(rowIndex)) {
        return '#AAA';
      }

      return 'grey';
    }

    isCellAtCoorsVisible(rowIndex: number, colIndex: number) {
      let {leftX, topY, innerWidth, innerHeight} = this.getCellDrawCoords(
        rowIndex,
        colIndex);

      return this.isCellPositionInViewport(
        leftX,
        topY,
        innerWidth,
        innerHeight);
    }

    private getCellDrawCoords(rowIndex: number, colIndex: number):{
      leftX: number,
      topY: number,
      innerWidth: number,
      innerHeight: number,
    } {
        let leftX = this.grid.s(this.grid.dimensions.rowGuideWidth) +
          this.grid.s(((1 + colIndex) * this.grid.dimensions.cellMargin) +
                 colIndex * this.grid.dimensions.cellWidth);
        let topY = this.grid.s(this.grid.dimensions.columnHeaderHeight) +
          this.grid.s(((1 + rowIndex) * this.grid.dimensions.cellMargin) + rowIndex * this.grid.dimensions.cellHeight)

        let innerWidth = this.grid.s(this.grid.dimensions.cellWidth);
        let innerHeight = this.grid.s(this.grid.dimensions.cellHeight);

        return {
          leftX,
          topY,
          innerWidth,
          innerHeight
        };
    }

    private isCellPositionInViewport(
      leftX:number,
      topY:number,
      innerWidth:number,
      innerHeight:number):Boolean {

      return this.grid.isInViewport(
        leftX - this.grid.s(this.grid.dimensions.rowGuideWidth),
        topY - this.grid.s(this.grid.dimensions.columnHeaderHeight),
        innerWidth,
        innerHeight)
    }

    drawCell(
      rowIndex:number,
      columnIndex:number,
      cell:any) {
        this.grid.ctx.fillStyle = this.getColumnFillColor(
          rowIndex,
          columnIndex);

        let {leftX, topY, innerWidth, innerHeight} = this.getCellDrawCoords(
            rowIndex,
            columnIndex);

        this.grid.debug && this.grid.debugInfo.drawnCells++;

        this.grid.ctx.fillRect(
          leftX - this.grid.viewportOffset.x,
          topY - this.grid.viewportOffset.y,
          innerWidth,
          innerHeight);

          this.grid.ctx.fillStyle = 'red';

          this.grid.drawText(
            this.grid.s(12),
            leftX - this.grid.viewportOffset.x,
            topY + innerHeight / 2 - this.grid.viewportOffset.y,
            String(rowIndex) + ' - ' + String(columnIndex))
      }
}

export {CellRenderer}
