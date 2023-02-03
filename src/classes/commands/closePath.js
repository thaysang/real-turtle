import Command from "../constructors/drawingCommand";

export default class ClosePathCommand extends Command {
  static aliases = ["ef"];
  static params = {};

  constructor(options) {
    super(options);
  }

  estimate(main) {
    return {
      requiredTime: 0,
    };
  }

  prepare(main) {}

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      ctx.closePath();
      if(this.state.fillStyle){
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.state.fillStyle;
        ctx.fill();
      }
      this.state.setPathActive(false);
      resolve();
    });
  }
}
