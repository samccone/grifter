import {IValidatable} from './ivalidatable'

class MouseState extends IValidatable {
  mouseOver: boolean;
  mouseDown: boolean;
  mouseOffViewport: boolean;

  constructor({mouseOver, mouseDown, mouseOffViewport}:
              {mouseDown: boolean,
               mouseOver: boolean,
               mouseOffViewport: boolean}) {
    super()

    this.propValidations = ['mouseOver', 'mouseDown', 'mouseOffViewport'];
    this.mouseOver = mouseOver;
    this.mouseDown = mouseDown;
    this.mouseOffViewport = mouseOffViewport;

    this.syncState();
  }
}

export {MouseState}
