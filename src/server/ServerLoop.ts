class ServerLoop {
    /**
     Length of a tick in milliseconds. The denominator is your desired framerate.
     e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
     */
    private _tickLengthMs = 1000 / 20;
    private _previousTick = Date.now();
    private _actualTicks = 0;

    private _update : (dt : number) => void;


    constructor(update  : (dt : number) => void) {
        this._update = update;
    }

    start() {

    }

    pause() {

    }

    loop () {
        var self = this;
        var now = Date.now();

        this._actualTicks++;
        if (this._previousTick + this._tickLengthMs <= now) {
            var delta = (now - this._previousTick) / 1000;
            this._previousTick = now;

            this._update(delta);

            console.log('delta', delta, '(target: ' + this._tickLengthMs +' ms)', 'node ticks', this._actualTicks);
            this._actualTicks = 0
        }

        if (Date.now() - this._previousTick < this._tickLengthMs - 16) {
            setTimeout(() => {
                self.loop();
            });
        } else {
            setImmediate(() => {
                self.loop();
            });
        }
    }
}