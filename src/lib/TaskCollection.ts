class TaskCollection { //TODO: better name?
    private _tasks = [];
    private _callback;
    private _active = 0;


    constructor(tasks, callback){
        this._tasks = tasks;
        this._callback = callback;
    }

    add(task) {
        this._tasks.push(task);
    }

    private complete() {
        this._active--;
        if(this._active === 0) {
            console.groupEnd();
            this._callback();
        }
    }

    run(name : string){
        console.groupCollapsed(name);
        this._active = this._tasks.length;
        for (var i = 0; i < this._tasks.length; i++) {
            this._tasks[i](this.complete.bind(this));
        }
        //TODO: fix if no tasks
    }
}