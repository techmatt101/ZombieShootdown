const SMOOTHING = 0.1;

export class PerfStats {
    #timings = new Map<string, number>();
    #startedAt = new Map<string, number>();
    #counters = new Map<string, number>();
    #lastFrameAt : number | null = null;

    frame() {
        const now = performance.now();
        if (this.#lastFrameAt !== null) {
            this.#smooth('frame', now - this.#lastFrameAt);
        }
        this.#lastFrameAt = now;
    }

    begin(name : string) {
        this.#startedAt.set(name, performance.now());
    }

    end(name : string) {
        const startedAt = this.#startedAt.get(name);
        if (startedAt !== undefined) {
            this.#smooth(name, performance.now() - startedAt);
        }
    }

    count(name : string, value : number) {
        this.#counters.set(name, value);
    }

    timing(name : string) {
        return this.#timings.get(name) ?? 0;
    }

    timings() {
        return this.#timings.entries();
    }

    counters() {
        return this.#counters.entries();
    }

    #smooth(name : string, milliseconds : number) {
        const previous = this.#timings.get(name) ?? milliseconds;
        this.#timings.set(name, previous + (milliseconds - previous) * SMOOTHING);
    }
}
