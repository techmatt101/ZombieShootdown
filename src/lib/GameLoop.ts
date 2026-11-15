const MAX_FRAME_STEP = 1;
const MS_PER_STEP = 100;

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
        const elapsed = Math.max(now - this.#lastFrameTime, 0);
        const dt = Math.min(elapsed / MS_PER_STEP, MAX_FRAME_STEP);
        this.#lastFrameTime = now;
        this.#frameRequest = requestAnimationFrame(this.#loop);
        this.#update(dt);
    };
}
