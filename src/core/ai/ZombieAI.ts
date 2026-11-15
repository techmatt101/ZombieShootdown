import type { IAI } from './IAI';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Vector } from '../../lib/geometry/Vector';
import { randInt } from '../../lib/helpers';

//var aiWorker = new Worker(new URL("../../workers/ai.ts", import.meta.url), { type: "module" }); //TODO: UBER HACK!!!!

export class ZombieAI implements IAI {
    private _zombie : Entity;
    private _player : Entity;

    private _canSeePlayer = false;

    //private _worker = new Worker(new URL("../../workers/ai.ts", import.meta.url), { type: "module" });
    private _workerWorking = false;

    private _headingLocation = new Vector(40, 40);
    private _id = randInt(0, 1000);


    constructor(entity : Entity, player : Entity) {
        this._zombie = entity;
        this._player = player;

        //this._worker.onmessage = (e) => {
        //    self._workerWorking = false;
        //    self._canSeePlayer = e.data;
        //};

        //aiWorker.addEventListener('message', (e) => {
        //    if (e.data.id == self._id) {
        //        self._canSeePlayer = e.data.value;
        //        self._workerWorking = false;
        //    }
        //});
    }

    updatePathFind(segments) {
        //if (!this._workerWorking) {
        //    aiWorker.postMessage({
        //        id: this._id,
        //        p1: {x: this._zombie.pos.x, y: this._zombie.pos.y},
        //        p2: {x: this._player.pos.x, y: this._player.pos.y},
        //        segments: segments
        //    });
        //    this._workerWorking = true;
        //}
    }

    update(dt : number) {
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
            this._zombie.components.movement.direction.copy(pos).sub(this._zombie.pos);
        }
    }
}
