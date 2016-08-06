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

      let leftX = grid.s(((1 + columnIndex) * 5) + columnIndex * 100)
      let topY = grid.s(grid.dimensions.columnHeaderHeight) +
                 grid.s(((1 + rowIndex) * 5) + rowIndex * 100)
      let innerWidth = grid.s(100);
      let innerHeight = grid.s(100);

      if (!grid.isInViewport(leftX, topY, innerWidth, innerHeight)) {
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