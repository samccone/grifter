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

    drawCell(
      rowIndex:number,
      columnIndex:number,
      cell:any,
      grid:InfiniteGrid) {
        grid.ctx.fillStyle = this.getColumnFillColor(rowIndex, columnIndex, grid);

        let leftX = grid.s(grid.dimensions.rowGuideWidth) +
          grid.s(((1 + columnIndex) * grid.dimensions.cellMargin) +
                 columnIndex * grid.dimensions.cellWidth);

        let topY = grid.s(grid.dimensions.columnHeaderHeight) +
          grid.s(((1 + rowIndex) * grid.dimensions.cellMargin) + rowIndex * grid.dimensions.cellHeight)
        let innerWidth = grid.s(grid.dimensions.cellWidth);
        let innerHeight = grid.s(grid.dimensions.cellHeight);

        if (!grid.isInViewport(
          leftX - grid.s(grid.dimensions.rowGuideWidth),
          topY - grid.s(grid.dimensions.columnHeaderHeight),
          innerWidth,
          innerHeight)) {
          return;
        }

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
