module ZombieApp {
    export class EventHandler<T> {
        private _listeners = [];

        fire(key : T, data?) {
            var listeners = this._listeners[<any>key];
            if (typeof listeners !== 'undefined') {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](data);
                }
            }
        }

        add(key : T, callback) {
            if (typeof this._listeners[<any>key] === 'undefined') {
                this._listeners[<any>key] = [];
            }
            this._listeners[<any>key].push(callback);
        }

        remove() {

        }

        clear() {
            this._listeners = [];
        }
    }
}