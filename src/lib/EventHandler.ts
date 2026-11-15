export type Listener = (data? : any) => void;

export interface IObserver<T = number> {
    on(event_type : T, callback : Listener) : void;
    off() : void;
}

export class EventHandler<T extends PropertyKey> {
    #listeners = new Map<T, Listener[]>();

    fire(key : T, data? : unknown) {
        var listeners = this.#listeners.get(key);
        if (typeof listeners !== 'undefined') {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i](data);
            }
        }
    }

    add(key : T, callback : Listener) {
        var listeners = this.#listeners.get(key);
        if (typeof listeners === 'undefined') {
            listeners = [];
            this.#listeners.set(key, listeners);
        }
        listeners.push(callback);
    }

    remove() {

    }

    clear() {
        this.#listeners.clear();
    }
}
