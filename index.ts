import {InfiniteGrid} from './grid';

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

var grid = new InfiniteGrid(
    document.body,
    dimensions,
    dataProvider);
grid.debug = false;
grid.render();

window.ranger.addEventListener('input', function(e) {
    grid.updateScalar(parseFloat(e.target.value))
})

window.addEventListener('resize', function() {
    grid.updateDimensions({
        height: window.innerHeight * window.devicePixelRatio,
        width: window.innerWidth * window.devicePixelRatio,
        columnHeaderHeight: 30,
    });
});