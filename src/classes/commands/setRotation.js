import Command from "../constructors/drawingCommand";

export default class SetRotationCommand extends Command {
  static aliases = ["seth"];
  static params = {
    deg: new Number(),
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
      this.state.setRotation(this.options.deg);
      resolve();
    });
  }
}
