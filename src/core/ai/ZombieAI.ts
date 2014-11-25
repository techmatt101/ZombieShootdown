var aiWorker = new Worker("core/workers/ai.js"); //TODO: UBER HACK!!!!

class ZombieAI implements IAI {
    private _zombie : Entity;
    private _player : Entity;

    private _canSeePlayer = false;

    //private _worker = new Worker("core/workers/ai.js");
    private _workerWorking = false;

    private _headingLocation = new Vector(40,40);
    private _id = randInt(0,1000);


    constructor (entity : Entity, player : Entity) {
        this._zombie = entity;
        this._player = player;

        var self = this;
        //this._worker.onmessage = function (e) {
        //    self._workerWorking = false;
        //    self._canSeePlayer = e.data;
        //};

        aiWorker.addEventListener('message', function (e) {
            if(e.data.id == self._id) {
                self._canSeePlayer = e.data.value;
                self._workerWorking = false;
            }
        });
    }

    updatePathFind(segments) {
        if (!this._workerWorking) {
            aiWorker.postMessage({
                id: this._id,
                p1: {x: this._zombie.pos.x, y: this._zombie.pos.y},
                p2: {x: this._player.pos.x, y: this._player.pos.y},
                segments: segments
            });
            this._workerWorking = true;
        }
    }

    update (dt : number) {
        if (this._zombie.hasActiveComponent(Movement)) {
            var pos : Vector;
            if (this._canSeePlayer) {
                pos = this._player.pos;
                this._zombie.components.movement.speed = 15;
            } else {
                this._zombie.components.movement.speed = 3;
                pos = this._headingLocation;
            }

            this._zombie.pos.rotateDirection(pos);
            this._zombie.components.movement.direct(pos.clone().sub(this._zombie.pos), dt);  //TODO: optimize
        }
    }
}