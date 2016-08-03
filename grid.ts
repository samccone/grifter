// https://github.com/Microsoft/TypeScript/issues/3429
interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

interface Dimensions {
  width: number,
  height: number,
  columnHeaderHeight: number,
};

interface Offset {
  x: number,
  y: number
};

class InfiniteGrid {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dimensions: Dimensions; 
  private dataProvider: any;
  private viewportOffset: Offset;
  private previousOffset: Offset;
  private mouseOverPosition: Offset;
  private previousMouseOverPosition: Offset;
  private mouseOverTargets: {col: Number, row: Number};
  private scalar: number;
  private oldScalar: number;
  private debugInfo = {
    drawnColumnHeaders: 0,
    drawnCells: 0
  };
  debug:boolean = false;

  constructor(
    container: HTMLElement, 
    dimensions: Dimensions, 
    dataProvider) {
    
    this.viewportOffset = {x: 0, y: 0};
    this.previousOffset = {x: 0, y: 0};
    this.mouseOverTargets = {col: -1, row: -1};
    this.mouseOverPosition = {x: -1, y: -1};
    this.previousMouseOverPosition = {x: -1, y: -1};
    
    this.scalar = 1;
    this.oldScalar = 1;

    this.container = container;
    this.dataProvider = dataProvider;
    this.dimensions = dimensions;
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
    this.canvas.addEventListener(
      'wheel', 
      this.onMouseWheel.bind(this))

    this.canvas.addEventListener(
      'mousemove', 
      this.onMouseMove.bind(this))    
  }

  private setup(dimensions:Dimensions) {
    this.canvas = document.createElement('canvas');
    this.setDimensions(dimensions) 

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.setEventListeners();
    this.renderLoop();
  }

  private onMouseMove(e:MouseEvent) {
    this.mouseOverPosition = {
      x: e.clientX * window.devicePixelRatio,
      y: e.clientY * window.devicePixelRatio
    };
  }

  private calculateMouseOverTargets() {
    let xWithOffset = this.previousMouseOverPosition.x + this.viewportOffset.x;
    let yWithOffset = this.previousMouseOverPosition.y + this.viewportOffset.y;
    
    this.mouseOverTargets = {
      col: Math.floor(xWithOffset / this.getColumnOuterWidth()),
      row: Math.floor((
        yWithOffset - this.s(this.dimensions.columnHeaderHeight)) / this.getColumnOuterHeight()) 
    }
  }

  private onMouseWheel(e:WheelEvent) {
    this.viewportOffset.x += e.deltaX;
    this.viewportOffset.y += e.deltaY;

    if (this.viewportOffset.x < 0) {
      this.viewportOffset.x = 0;
    }

    if (this.viewportOffset.y < 0) {
      this.viewportOffset.y = 0;
    }
  }

  private renderLoop() {
    if (this.invalidated()) {
      this.calculateMouseOverTargets();
      this.previousOffset = Object.assign({}, this.viewportOffset);
      this.previousMouseOverPosition = Object.assign({}, this.mouseOverPosition);
      this.oldScalar = this.scalar;

      this.render();
    }

    window.requestAnimationFrame(
      this.renderLoop.bind(this));  
  }

  private invalidated():boolean {
    return (
      this.viewportOffset.x !== this.previousOffset.x ||
      this.viewportOffset.y !== this.previousOffset.y ||
      this.mouseOverPosition.x!== this.previousMouseOverPosition.x ||
      this.mouseOverPosition.y!== this.previousMouseOverPosition.y ||
      this.scalar !== this.oldScalar);
  }

  renderColumnHeaders() {
    this.ctx.fillStyle = 'black';

    // background fill color.
    this.ctx.fillRect(
      0, 
      0, 
      this.dimensions.width, 
      this.s(this.dimensions.columnHeaderHeight));
  
    for(let i = 0; i < this.dataProvider.columns.count; ++i) {
      this.drawColumnHeader(i); 
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
    this.debug && (this.debugInfo.drawnCells = 0; this.debugInfo.drawnColumnHeaders = 0;);

    this.dataProvider.rows.forEach((row, rowIndex) => {
      row.columns.forEach((column, columnIndex) => {
        this.drawColumnItem(rowIndex, row, columnIndex, column);  
      });
    });

    this.renderColumnHeaders();

    this.debug && console.debug(JSON.stringify(this.debugInfo));
  }

  private isInViewport(
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

  private s(val:number):number {
    return val * this.scalar;
  }

  private drawText(
    fontSize:number, 
    x:number, 
    y:number, 
    text:string) {
      
    // No need to draw text less than 4px
    if (fontSize < 5) {
      return;
    }    

    this.ctx.font = `${fontSize}px Roboto`
    this.ctx.fillText(text, x, y);
  }

  private drawColumnHeader(columnIndex:number) {
      let leftX = this.s(((1 + columnIndex) * 5) + columnIndex * 100)
      let topY = 0 
      let innerWidth = this.s(100);
      let innerHeight = this.s(this.dimensions.columnHeaderHeight);

      if (!this.isInViewport(
        leftX, 
        topY + this.viewportOffset.y, 
        innerWidth, 
        innerHeight)) {
        return;
      }

      this.debug && this.debugInfo.drawnColumnHeaders++;

      this.ctx.fillStyle = 'orange';
      this.ctx.fillRect(
        leftX - this.viewportOffset.x, 
        topY, 
        innerWidth, 
        innerHeight);

      this.ctx.fillStyle = 'black';
      this.drawText(
        this.s(12),
        leftX - this.viewportOffset.x, 
        topY + innerHeight / 2,
        String(columnIndex) + ' - column')
  }

  private getColumnOuterWidth() {
    return this.s(5 + 100);
  }

  private getColumnOuterHeight() {
    return this.s(5 + 100);
  }

  private isHovered(row:number, col:number) {
    return this.mouseOverTargets.row === row || 
    this.mouseOverTargets.col === col;
  }

  private drawColumnItem(
    rowIndex: number, 
    row: any,
    columnIndex: number,
    column: any) {
      if (this.isHovered(rowIndex, columnIndex)) {
        this.ctx.fillStyle = '#AAA';
      } else {
        this.ctx.fillStyle = 'grey';
      }

      let leftX = this.s(((1 + columnIndex) * 5) + columnIndex * 100)
      let topY = this.s(this.dimensions.columnHeaderHeight) + 
                 this.s(((1 + rowIndex) * 5) + rowIndex * 100)
      let innerWidth = this.s(100);
      let innerHeight = this.s(100);

      if (!this.isInViewport(leftX, topY, innerWidth, innerHeight)) {
        return;
      }

      this.debug && this.debugInfo.drawnCells++;

      this.ctx.fillRect(
        leftX - this.viewportOffset.x, 
        topY - this.viewportOffset.y, 
        innerWidth, 
        innerHeight);

      this.ctx.fillStyle = 'red';

      this.drawText(
        this.s(12),
        leftX - this.viewportOffset.x, 
        topY + innerHeight / 2 - this.viewportOffset.y,
        String(rowIndex) + ' - ' + String(columnIndex))
    }
}

export {InfiniteGrid}