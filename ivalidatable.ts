abstract class IValidatable {
  state:Object;
  tailState = {};
  propValidations:Array<string>;

  syncState() {
    this.propValidations.forEach(key => {
      this.tailState[key] = this[key];
    }, this);
  }

  invalidated():boolean {
    return this.propValidations.reduce((invalid:boolean, prop:string) => {
      return (this.tailState[prop] !== this[prop]) || invalid;
    }, false);
  }
}

export {IValidatable}
