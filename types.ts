type Row = {}
type Column = {
  start: number,
  end: number
}

interface DataProvider {
  rows: Array<Array<Row>>,
  columns: Array<Column>,
  rowColumnToColumnGroup: {[k: number]: number}
}

/**
{
 rowColumnToColumnGroup: {
  0: 0
  1: 0
  2: 0
  3: 1
  4: 2
  5: 3
 }
 columns: [
  {        }, {}, {}, {}, {}
 ],
 rows: [
  [{}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}],
 ]
}
 */
export {DataProvider}
