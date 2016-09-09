import {IValidatable} from './ivalidatable'

class MouseState extends IValidatable {
  mouseOver: boolean;
  mouseDown: boolean;

  constructor({mouseOver, mouseDown}: {mouseDown: Boolean, mouseOver: Boolean}) {
    super()

    this.propValidations = ['mouseOver', 'mouseDown'];
    this.mouseOver = mouseOver;
    this.mouseDown = mouseDown;
    this.syncState();
  }
}

export {MouseState}
