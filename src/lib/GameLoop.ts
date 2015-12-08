class GameLoop {
    private _lastGameLoopFrame = 0;
    private _requestedAnimationFrame = 0;
    private _update : (dt : number) => void;


    constructor(update : (dt : number) => void) {
        this._update = update;
    }

    start() {
        this._lastGameLoopFrame = new Date().getTime();
        window.requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        var now = new Date().getTime(),
            dt = (now - this._lastGameLoopFrame) / 100;
        if (dt > 1) {// Prevent fast-forwarding by limiting the length of a single frame. //todo: needed?
            dt = 1;
        }
        this._requestedAnimationFrame = window.requestAnimationFrame(this.loop.bind(this));
        this._lastGameLoopFrame = now;
        this._update(dt);
    }

    pause() {
        window.cancelAnimationFrame(this._requestedAnimationFrame);
    }

    lag() {
        //var self = this; setTimeout(function() {window.requestAnimationFrame(self.loop.bind(self))}, 800); //force lag //todo: add debugging tools for this :D
    }
}