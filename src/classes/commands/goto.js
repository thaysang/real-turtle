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
        (1 - this.main.state.speed) * 5,
    };
  }

  prepare(main) {
    
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {

      if (!this.state.pathActive) {
        ctx.beginPath();
        ctx.moveTo(this.initialState.position.x, this.initialState.position.y);
      }

      ctx.lineTo(this.options.x, this.options.y);

      if (this.state.strokeActive) {
        ctx.stroke();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }

      this.state.setPosition(this.options.x, this.options.y);
      resolve();
    });
  }
}
