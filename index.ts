import {InfiniteGrid} from './grid';
import {CellRenderer} from './cell_renderer'

var dimensions = {
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    columnHeaderHeight: 30,
};

function generateRows(
    rowCount:Number,
    columnCount:Number) {
        let rows = [];

        for(var i = 0; i < rowCount; ++i) {
            rows[i] = {columns: []};
            for(var j = 0; j < columnCount; ++j) {
                rows[i].columns.push({});
            }
        }

        return rows;
}

var dataProvider = {
    rows: generateRows(1000, 100),
    columns: {
        count: 100
    }
};

var cellRenderer = new CellRenderer()

var grid = new InfiniteGrid(
    document.body,
    dimensions,
    dataProvider,
    cellRenderer);
    
grid.debug = false;
grid.render();

document.querySelector('#ranger').addEventListener('input', function(e:UIEvent) {
    let target = <HTMLInputElement>e.target; 
    grid.updateScalar(parseFloat(target.value))
});

window.addEventListener('resize', function() {
    grid.updateDimensions({
        height: window.innerHeight * window.devicePixelRatio,
        width: window.innerWidth * window.devicePixelRatio,
        columnHeaderHeight: 30,
    });
});