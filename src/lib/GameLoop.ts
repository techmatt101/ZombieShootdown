/** Drives `update(dt)` from requestAnimationFrame; `dt` is in tenths of a second, capped at 1. */
export class GameLoop {
    #lastFrameTime = 0;
    #frameRequest = 0;
    #update : (dt : number) => void;


    constructor(update : (dt : number) => void) {
        this.#update = update;
    }

    start() {
        this.#lastFrameTime = performance.now();
        this.#frameRequest = requestAnimationFrame(this.#loop);
    }

    pause() {
        cancelAnimationFrame(this.#frameRequest);
    }

    #loop = (now : DOMHighResTimeStamp) => {
        // Prevent fast-forwarding by limiting the length of a single frame.
        const dt = Math.min(Math.max(now - this.#lastFrameTime, 0) / 100, 1);
        // Queue the next frame before updating so update() can pause the loop.
        this.#frameRequest = requestAnimationFrame(this.#loop);
        this.#lastFrameTime = now;
        this.#update(dt);
    };
}
