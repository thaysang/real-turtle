import Command from "../constructors/drawingCommand";

export default class DotCommand extends Command {
  static params = {
    size: new Number(),
    color: new String(),
  };

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
   
      if (!this.state.pathActive || ctx == this.main.ctx) {
        ctx.beginPath();
      }
      
      ctx.fillStyle = this.options.color
      ctx.arc(
        this.state.position.x,
        this.state.position.y,
        this.options.size/2,
        0,
        2 * Math.PI
      );

      if (this.state.strokeActive) {
        ctx.fill();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }
      
      ctx.fillStyle = this.state.fillStyle
      resolve();
    });
  }
}