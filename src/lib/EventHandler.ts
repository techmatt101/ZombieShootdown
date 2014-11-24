class EventHandler<T> {
    private _listeners = {};

    fire (key : T, data?) {
        if (typeof this._listeners[<any>key] !== 'undefined') {
            for (var i = 0; i < this._listeners[<any>key].length; i++) {
                this._listeners[<any>key][i](data);
            }
        }
    }

    add (key : T, callback) {
        if (typeof this._listeners[<any>key] === 'undefined') {
            this._listeners[<any>key] = [];
        }
        this._listeners[<any>key].push(callback);
    }

    remove () {

    }

    clear () {
        this._listeners = {};
    }
}