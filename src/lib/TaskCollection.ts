export class TaskCollection { //TODO: better name?
    name : string;
    active = 0;

    #tasks : Array<() => void> = [];
    #tasksAsync : Array<(onComplete : () => void) => void> = [];
    #activeAsync = 0;
    #onComplete : () => void;
    #onTaskComplete? : () => void;


    constructor(name : string, onComplete : () => void, onTaskComplete? : () => void) {
        this.name = name;
        this.#onComplete = onComplete;
        this.#onTaskComplete = onTaskComplete;
    }

    add(task : () => void) {
        this.#tasks.push(task);
        return this;
    }

    addAsync(task : (onComplete : () => void) => void) {
        this.#tasksAsync.push(task);
        return this;
    }

    clear() {
        this.#tasks = [];
        this.#tasksAsync = [];
        this.active = 0;
    }

    #taskComplete() {
        this.active--;
        if (typeof this.#onTaskComplete !== 'undefined') {
            this.#onTaskComplete();
        }
    }

    #asyncTaskComplete(task : { name : string }) {
        console.timeEnd(task.name + ' (async)');
        this.#activeAsync--;
        this.#taskComplete();
        this.#testForComplete();
    }

    #testForComplete() {
        if (this.#activeAsync === 0) {
            console.timeEnd('Total Time');
            console.groupEnd();
            this.#onComplete();
        }
    }

    run() {
        console.group(this.name);
        console.time('Total Time');

        this.active = this.#tasksAsync.length + this.#tasks.length;

        this.#activeAsync = this.#tasksAsync.length;
        for (var i = 0; i < this.#tasksAsync.length; i++) {
            const task = this.#tasksAsync[i];
            console.time(task.name + ' (async)');
            task(() => this.#asyncTaskComplete(task));
        }

        for (var i = 0; i < this.#tasks.length; i++) { //TODO: give browser breathing room to update between tasks
            const task = this.#tasks[i];
            console.time(task.name);
            task();
            this.#taskComplete();
            console.timeEnd(task.name);
        }

        this.#testForComplete();
    }
}
