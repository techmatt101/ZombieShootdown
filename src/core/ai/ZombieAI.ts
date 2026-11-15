import type { IAI } from './IAI';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Vector } from '../../lib/geometry/Vector';
import { randInt } from '../../lib/helpers';
import type { Segment } from '../../lib/geometry/Segment';

//var aiWorker = new Worker(new URL("../../workers/ai.ts", import.meta.url), { type: "module" }); //TODO: UBER HACK!!!!

export class ZombieAI implements IAI {
    #zombie : Entity;
    #player : Entity;

    #canSeePlayer = false;

    //private _worker = new Worker(new URL("../../workers/ai.ts", import.meta.url), { type: "module" });
    #workerWorking = false;

    #headingLocation = new Vector(40, 40);
    #id = randInt(0, 1000);


    constructor(entity : Entity, player : Entity) {
        this.#zombie = entity;
        this.#player = player;

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

    updatePathFind(segments : Segment[]) {
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
        const movement = this.#zombie.components.movement;
        if (movement && this.#zombie.hasActiveComponent(Movement)) {
            var pos : Vector;
            if (this.#canSeePlayer) {
                pos = this.#player.pos;
                movement.speed = 15;
            } else {
                movement.speed = 3;
                pos = this.#headingLocation;
            }

            this.#zombie.pos.rotateDirection(pos);
            movement.direction.copy(pos).sub(this.#zombie.pos);
        }
    }
}
