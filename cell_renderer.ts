import {InfiniteGrid} from './grid'

class CellRenderer {
  grid: InfiniteGrid;

  private getColumnFillColor(
    rowIndex:number,
    colIndex:number):string {

      if (this.grid.isHovered(rowIndex, colIndex)) {
        return 'grey';
      }

      if (this.grid.isColumnHovered(colIndex) ||
          this.grid.isRowHovered(rowIndex)) {
        return '#AAA';
      }

      return 'grey';
    }

    getCellDrawCoords(rowIndex: number, colIndex: number):{
      leftX: number,
      topY: number,
      innerWidth: number,
      innerHeight: number,
    } {
        let leftX = this.grid.s(this.grid.dimensions.rowGuideWidth) +
          this.grid.s(((1 + colIndex) * this.grid.dimensions.cellMargin) +
                 colIndex * this.grid.dimensions.cellWidth);
        let topY = this.grid.s(this.grid.dimensions.columnHeaderHeight) +
          this.grid.s(((1 + rowIndex) * this.grid.dimensions.cellMargin) +
                      rowIndex * this.grid.dimensions.cellHeight);

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
      topOffset:number,
      leftOffset: number,
      rowIndex:number,
      columnIndex:number,
      cell:any) {
        this.grid.ctx.fillStyle = this.getColumnFillColor(
          rowIndex,
          columnIndex);

        let cellWidth = this.grid.s(this.grid.dimensions.cellWidth)
        let height = this.grid.s(this.grid.dimensions.cellHeight)
        this.grid.debug && this.grid.debugInfo.drawnCells++;

        this.grid.ctx.fillRect(leftOffset, topOffset, cellWidth, height);
        this.grid.ctx.fillStyle = 'hsl(0, 0%, 19%)';

        this.grid.drawText(
          this.grid.s(12),
          leftOffset,
          topOffset + height / 2,
          `${rowIndex}, ${columnIndex}`,
          cellWidth
        )
      }

}

export {CellRenderer}
