import {InfiniteGrid} from './grid'

class CellRenderer {
  private getColumnFillColor(
    rowIndex:number,
    colIndex:number,
    grid:InfiniteGrid):string {

      if (grid.isHovered(rowIndex, colIndex)) {
        return 'grey';
      }

      if (grid.isColumnHovered(colIndex) || grid.isRowHovered(rowIndex)) {
        return '#AAA';
      }

      return 'grey';
    }

    isCellAtCoorsVisible(rowIndex: number, colIndex: number, grid:InfiniteGrid) {
      let {leftX, topY, innerWidth, innerHeight} = this.getCellDrawCoords(
        rowIndex,
        colIndex,
        grid);

      return this.isCellPositionInViewport(
        leftX,
        topY,
        innerWidth,
        innerHeight,
        grid);
    }

    private getCellDrawCoords(rowIndex: number, colIndex: number, grid:InfiniteGrid):{
      leftX: number,
      topY: number,
      innerWidth: number,
      innerHeight: number,
    } {
        let leftX = grid.s(grid.dimensions.rowGuideWidth) +
          grid.s(((1 + colIndex) * grid.dimensions.cellMargin) +
                 colIndex * grid.dimensions.cellWidth);
        let topY = grid.s(grid.dimensions.columnHeaderHeight) +
          grid.s(((1 + rowIndex) * grid.dimensions.cellMargin) + rowIndex * grid.dimensions.cellHeight)

        let innerWidth = grid.s(grid.dimensions.cellWidth);
        let innerHeight = grid.s(grid.dimensions.cellHeight);

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
      innerHeight:number,
      grid:InfiniteGrid
    ):Boolean {

      return grid.isInViewport(
        leftX - grid.s(grid.dimensions.rowGuideWidth),
        topY - grid.s(grid.dimensions.columnHeaderHeight),
        innerWidth,
        innerHeight)
    }

    drawCell(
      rowIndex:number,
      columnIndex:number,
      cell:any,
      grid:InfiniteGrid) {
        grid.ctx.fillStyle = this.getColumnFillColor(rowIndex, columnIndex, grid);

        let {leftX, topY, innerWidth, innerHeight} = this.getCellDrawCoords(
            rowIndex,
            columnIndex,
            grid);

        grid.debug && grid.debugInfo.drawnCells++;

        grid.ctx.fillRect(
          leftX - grid.viewportOffset.x,
          topY - grid.viewportOffset.y,
          innerWidth,
          innerHeight);

          grid.ctx.fillStyle = 'red';

          grid.drawText(
            grid.s(12),
            leftX - grid.viewportOffset.x,
            topY + innerHeight / 2 - grid.viewportOffset.y,
            String(rowIndex) + ' - ' + String(columnIndex))
      }
}

export {CellRenderer}
