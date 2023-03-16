import Command from "../constructors/drawingCommand";

export default class GoToCommand extends Command {
  static aliases = ["gt"];
  static params = { x: new Number(), y: new Number() };
  constructor(options) {
    super(options);
  }

  estimate(main) {
    let steps = Math.sqrt((this.options.x - this.state.position.x)**2 + (this.options.y - this.state.position.y)**2)
    return {
      requiredTime:
      (1 - this.main.state.speed) * Math.abs(steps) * 5,
    };
  }

  prepare(main) {
    this.moveX = this.options.x - this.state.position.x 
    this.moveY = this.options.y - this.state.position.y
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      
      if (!this.state.pathActive) {
        ctx.beginPath();
        ctx.moveTo(this.initialState.position.x, this.initialState.position.y);
      }

      // this.state.setRotation(180*Math.atan2(this.moveY, this.moveX)/Math.PI+90);

      ctx.lineTo(this.options.x,this.options.y)

      if (this.state.strokeActive) {
        ctx.stroke();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }

      this.state.setPosition(this.options.x,this.options.y);
      
      resolve();
    });
  }
}
