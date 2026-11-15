export type Listener = (data? : any) => void;

export interface IObserver<T = number> {
    on(event_type : T, callback : Listener) : void;
    off() : void;
}

export class EventHandler<T extends PropertyKey> {
    #listeners = new Map<T, Listener[]>();

    fire(key : T, data? : unknown) {
        const listeners = this.#listeners.get(key);
        if (listeners !== undefined) {
            for (const listener of listeners) {
                listener(data);
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

    remove() {

    }

    clear() {
        this.#listeners.clear();
    }
}
