import {IValidatable} from './ivalidatable'

interface Offset {
  x: number,
  y: number
};

class XYPos extends IValidatable {
  x: number;
  y: number;

  constructor({x, y}:Offset) {
    super()

    this.propValidations = ['x', 'y'];
    this.x = x;
    this.y = y;
    this.syncState();
  }
}

export {XYPos}
