/// <reference path="IPool" />

class Pool <T> {
    private _factory : () => IPool;
    private _objects = [];
    private _available = [];
    private _nextAvailableId = 0;


    constructor (factory : () => IPool, prepopulate = 0) {
        this._factory = factory;

        for (var i = 0; i < prepopulate; i++) {
            this.buildNew();
        }
        this.updateAvailability();
    }

    getSize () {
        return this._objects.length;
    }

    acquire () : T {
        var obj;
        if (this._nextAvailableId === -1) {
            this.updateAvailability();
        }
        if (this._nextAvailableId === -1) {
            obj = this.buildNew();
        } else {
            obj = this._available[this._nextAvailableId];
            this._nextAvailableId--;
        }

        obj.available = false;
        return obj;
    }

    private buildNew () {
        var newObj = this._factory();
        this._objects.push(newObj);

        return newObj;
    }

    private updateAvailability () {
        this._available = [];
        var objectLength = this._objects.length;
        for (var i = 0; i < objectLength; i++) {
            if (this._objects[i].available) {
                this._available.push(this._objects[i]);
            }
        }
        this._nextAvailableId = this._available.length - 1;
    }
}