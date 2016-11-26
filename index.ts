import {InfiniteGrid} from './grid';
import {CellRenderer} from './cell_renderer'
import {DataProvider} from './types'

var dimensions = {
  width: window.innerWidth * window.devicePixelRatio,
  height: window.innerHeight * window.devicePixelRatio,
  columnHeaderHeight: 70 * window.devicePixelRatio,
  cellHeight: 100 * window.devicePixelRatio,
  cellWidth: 100 * window.devicePixelRatio,
  cellMargin: 5 * window.devicePixelRatio,
  rowGuideWidth: 150 * window.devicePixelRatio,
};

const dataProvider: DataProvider = {
  rows: [
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
  ],
  rowColumnToColumnGroup: {
    0: 0,
    1: 1,
    2: 1,
    3: 2,
    4: 3,
  },
  columns: [{
    start: 0,
    end: 1
  }, {
    start: 1,
    end: 3
  }, {
    start: 3,
    end: 4
  }, {
    start: 4,
    end: 5
  }]
};

const cellRenderer = new CellRenderer()

const grid = new InfiniteGrid(
  document.body,
  dimensions,
  dataProvider,
  cellRenderer);

grid.debug = false;
grid.render();

document.querySelector('#ranger').addEventListener('input', (e:UIEvent) => {
  let target = <HTMLInputElement>e.target;
  grid.updateScalar(parseFloat(target.value))
  grid.scrollByPixels(0, 0);
});

window.addEventListener('resize', function() {
  grid.setFrameSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );

  grid.render();
});
