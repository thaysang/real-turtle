import Command from "../constructors/drawingCommand";

export default class MoveCommand extends Command {
  static aliases = ["gt"];
  static params = { x: new Number(), y: new Number() };
  constructor(options) {
    super(options);
  }

  estimate(main) {
    return {
      requiredTime:
        (1 - this.main.state.speed) * Math.abs(this.steps) * 5,
    };
  }

  prepare(main) {
    this.moveX = this.options.x - this.initialState.position.x 
    this.moveY = this.options.y - this.initialState.position.y
    this.steps = Math.sqrt(this.moveX**2 + this.moveY**2)
    this.deg = 180*Math.atan2(this.moveY, this.moveX)/Math.PI + 90;
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      let xNow = this.options.x + this.initialState.position.x * (1 - progress);
      let yNow = this.options.y + this.initialState.position.y * (1 - progress);
      if (!this.state.pathActive) {
        ctx.beginPath();
        ctx.moveTo(this.initialState.position.x, this.initialState.position.y);
      }
      // this.state.setRotation(this.angle)
      ctx.lineTo(xNow, yNow);

      if (this.state.strokeActive) {
        ctx.stroke();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }

      this.state.setPosition(xNow, yNow);
      this.state.setRotation(this.deg);
      resolve();
    });
  }
}
