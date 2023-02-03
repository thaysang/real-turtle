import Command from "../constructors/drawingCommand";

export default class BeginPathCommand extends Command {
  static aliases = ["beginFill"];
  static params = {style: new String(),};

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
      ctx.beginPath();
      this.state.setFillStyle(this.options.style);
      ctx.moveTo(this.initialState.position.x, this.initialState.position.y);
      this.state.setPathActive(true);
      resolve();
    });
  }
}
