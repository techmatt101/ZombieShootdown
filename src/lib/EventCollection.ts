export class EventCollection {
    #totalEvents = 0;
    #activeEvents = 0;
    #onComplete : () => void;
    #onEventComplete? : () => void;


    constructor(onComplete : () => void, onEventComplete? : () => void) {
        this.#onComplete = onComplete;
        this.#onEventComplete = onEventComplete;
    }

    listen(action? : () => void) {
        this.#activeEvents++;
        this.#totalEvents++;

        return () => {
            action?.();
            this.#onEventComplete?.();
            this.#testForComplete();
        };
    }

    reset(overrideTotalEvents? : number) {
        this.#activeEvents = overrideTotalEvents ?? this.#totalEvents;
    }

    #testForComplete() {
        this.#activeEvents--;
        if (this.#activeEvents === 0) {
            this.#onComplete();
        }
    }
}
