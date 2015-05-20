class EventCollection {
    private _totalEvents = 0;
    private _activeEvents = 0;
    private _onComplete : () => void;
    private _onEventComplete : () => void;


    constructor(onComplete : () => void, onEventComplete? : () => void) {
        this._onComplete = onComplete;
        this._onEventComplete = onEventComplete;
    }

    listen(action?) {
        this._activeEvents++;
        this._totalEvents++;

        return () => {
            if (typeof action !== 'undefined') {
                action();
            }
            if (typeof this._onEventComplete !== 'undefined') {
                this._onEventComplete();
            }
            this.testForComplete();
        };
    }

    reset(overrideTotalEvents?) {
        this._activeEvents = overrideTotalEvents || this._totalEvents;
    }

    private testForComplete() {
        this._activeEvents--;
        if (this._activeEvents === 0) {
            this._onComplete();
        }
    }
}