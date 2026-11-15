export type Task = () => void | Promise<void>;

export class TaskCollection {
    readonly name : string;
    #tasks : Array<{ name : string; run : Task }> = [];

    constructor(name : string) {
        this.name = name;
    }

    add(name : string, run : Task) {
        this.#tasks.push({ name, run });
        return this;
    }

    async run() {
        console.group(this.name);
        console.time('Total Time');

        for (const task of this.#tasks) {
            console.time(task.name);
            await task.run();
            console.timeEnd(task.name);
        }

        console.timeEnd('Total Time');
        console.groupEnd();
    }
}
