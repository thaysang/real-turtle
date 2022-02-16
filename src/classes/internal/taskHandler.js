import InternalClass from "../constructors/internalClass";

import Task from "./task.js";

export default class TaskHandler extends InternalClass {
  constructor(main) {
    super(main);
    this.tasks = [];
    this.ctx = this.main.ctx;
    this.canvas = this.main.canvas;
    this.cacheCanvas = null;

    this.isExecuting = false;
  }

  addTask(name, options) {
    this.tasks.push(new Task(name, options));
  }

  drawTurtle() {
    if (this.main.state.size == 0) {
      return;
    }

    var angleInRadians = this.main.state.rotation * (Math.PI / 180);

    var x = this.main.state.position.x;
    var y = this.main.state.position.y;
    var width = this.main.state.size;
    var height = this.main.state.size;
    var image = this.main.state.image.object;

    this.ctx.translate(x, y);
    this.ctx.rotate(angleInRadians);
    this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
    this.ctx.rotate(-angleInRadians);
    this.ctx.translate(-x, -y);
  }

  async executeTasks() {
    return new Promise((resolve, reject) => {
      if (this.isExecuting) {
        reject();
        return;
      }

      this.isExecuting = true;

      if (!this.main.options.async) {
        this.cacheCanvas = null;
        this.previousCanvas = null;

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      if (this.tasks.length == 0) {
        reject();
        return;
      }

      //Resolve when finished
      this.onExecutionFinished = () => {
        resolve();
      };

      this.taskEstimationCallbacks = [];
      for (var i = 0; i < this.tasks.length; i++) {
        this.taskEstimationCallbacks.push(this.tasks[i].estimate(this.main));
      }

      this.executionFinished = false;

      this.executionStartTime = new Date().getTime();
      this.taskStartTime = this.executionStartTime;

      this.activeTaskKey = 0;
      this.activeTask = this.tasks[0];
      this.activeTaskEstimationCallback = this.taskEstimationCallbacks[0];
      this.activeTaskProgress = 0;
      this.activeTaskFirstPaint = true;

      if (!this.cacheCanvas) {
        //Create the cache canvas which gets updated once a step is finished
        //It enables the library to ensure that canvas steps are executed "natively" regardless of any animations
        //.fill() is made possible by this for example

        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = this.canvas.width;
        this.cacheCanvas.height = this.canvas.height;
        this.cacheCtx = this.cacheCanvas.getContext("2d");
        this.cacheCtx.drawImage(this.canvas, 0, 0);
        document.body.append(this.cacheCanvas);
      }

      if (!this.previousCanvas) {
        //Create the cache canvas which gets updated everytime a new step is finished

        this.previousCanvas = document.createElement("canvas");
        this.previousCanvas.width = this.canvas.width;
        this.previousCanvas.height = this.canvas.height;
        this.previousCtx = this.previousCanvas.getContext("2d");
        this.previousCtx.drawImage(this.canvas, 0, 0);
      }

      this.drawTurtle();

      this.activeTask.prepare(this.main);
      window.requestAnimationFrame(() => {
        this.executeDrawingStep();
      });
    });
  }

  async executeDrawingStep() {
    // Calculate progress
    if (this.main.state.speed < 1) {
      var timeNow = new Date().getTime();

      if (this.activeTaskEstimationCallback.requiredTime == 0) {
        this.activeTaskProgress = 1;
      } else {
        this.activeTaskProgress =
          (timeNow - this.taskStartTime) /
          this.activeTaskEstimationCallback.requiredTime;
      }
      if (this.activeTaskProgress >= 1) {
        this.activeTaskProgress = 1;
      }
    }

    // Draw previous canvas onto main canvas
    if (this.prevoiusCanvas !== null) {
      this.ctx.drawImage(this.previousCanvas, 0, 0);
    } else {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //Draw the completed Task onto the cache canvas
    if (this.activeTaskFirstPaint) {
      if (this.main.state.speed < 1) {
        await this.activeTask.execute(1, this.cacheCtx);
      } else {
        this.activeTask.execute(1, this.cacheCtx);
      }
    }

    // Execute command

    // Await with speed lower than 1 (process)
    if (this.main.state.speed < 1) {
      await this.activeTask.execute(this.activeTaskProgress, this.ctx);
    }

    // No waiting with speed 1
    else {
      this.activeTask.execute(1, this.ctx);
    }

    this.activeTaskFirstPaint = false;

    // If task is finished now
    if (this.activeTaskProgress == 1) {
      if (this.activeTaskKey + 1 == this.tasks.length) {
        this.executionFinished = true;

        try {
          this.onExecutionFinished();
        } catch (e) {
          //nothing
        }

        this.isExecuting = false;

        if (!this.main.options.async) {
          this.cacheCanvas = null;
        }
      } else {
        this.activeTaskFirstPaint = true;
        this.activeTaskKey++;
        this.activeTask = this.tasks[this.activeTaskKey];
        this.activeTaskEstimationCallback = this.activeTask.estimate(this.main);
        this.activeTask.prepare(this.main);

        //Draw current canvas onto previous canvas
        if (this.previousCtx && this.cacheCanvas) {
          this.previousCtx.drawImage(this.cacheCanvas, 0, 0);
        }

        /* old version
        this.activeTaskEstimationCallback = this.taskEstimationCallbacks[
          this.activeTaskKey
        ];
        */
        this.taskStartTime = new Date().getTime();
      }
    }

    this.drawTurtle();

    if (!this.executionFinished) {
      if (this.main.state.speed < 1) {
        window.requestAnimationFrame(() => {
          this.executeDrawingStep();
        });
      } else {
        this.executeDrawingStep();
      }
    }
  }
}
