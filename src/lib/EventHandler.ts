export type Listener = (data? : any) => void;

export interface IObserver<T = number> {
    on(event_type : T, callback : Listener) : void;
    off(event_type : T, callback : Listener) : void;
}

export class EventHandler<T extends PropertyKey> {
    #listeners = new Map<T, Listener[]>();

    fire(key : T, data? : unknown) {
        const listeners = this.#listeners.get(key);
        if (listeners !== undefined) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i](data);
            }
        }
    }

    add(key : T, callback : Listener) {
        let listeners = this.#listeners.get(key);
        if (listeners === undefined) {
            listeners = [];
            this.#listeners.set(key, listeners);
        }
        listeners.push(callback);
    }

    remove(key : T, callback : Listener) {
        const listeners = this.#listeners.get(key);
        if (listeners === undefined) return;
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    clear() {
        this.#listeners.clear();
    }
}
