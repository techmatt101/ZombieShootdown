export class GameLoop {
    #lastGameLoopFrame = 0;
    #requestedAnimationFrame = 0;
    #update : (dt : number) => void;


    constructor(update : (dt : number) => void) {
        this.#update = update;
    }

    start() {
        this.#lastGameLoopFrame = new Date().getTime();
        window.requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        var now = new Date().getTime(),
            dt = (now - this.#lastGameLoopFrame) / 100;
        if (dt > 1) {// Prevent fast-forwarding by limiting the length of a single frame. //todo: needed?
            dt = 1;
        }
        this.#requestedAnimationFrame = window.requestAnimationFrame(this.loop.bind(this));
        this.#lastGameLoopFrame = now;
        this.#update(dt);
    }

    pause() {
        window.cancelAnimationFrame(this.#requestedAnimationFrame);
    }

    lag() {
        //var self = this; setTimeout(function() {window.requestAnimationFrame(self.loop.bind(self))}, 800); //force lag //todo: add debugging tools for this :D
    }
}
