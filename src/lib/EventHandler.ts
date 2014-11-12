class EventHandler<T> {
    private _listeners : any = {};

    fire (key : T) {
        if (typeof this._listeners[key] !== 'undefined') {
            for (var i = 0; i < this._listeners[key].length; i++) {
                this._listeners[key][i]();
            }
        }
    }

    add (key : T, callback) {
        if (typeof this._listeners[key] === 'undefined') {
            this._listeners[key] = [];
        }
        this._listeners[key].push(callback);
    }

    remove () {

    }

    clear () {
        this._listeners = {};
    }
}