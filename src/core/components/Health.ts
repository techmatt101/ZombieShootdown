import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';

export enum HealthEvent {
    DEATH
}

export class Health implements IComponent, IObserver<HealthEvent> {
    active = false;
    value : number;
    isDead = false;

    #eventHandler = new EventHandler<HealthEvent>();

    static reference(components : IComponentDirectory) {
        return components.health;
    }

    constructor(health : number = 100) {
        this.value = health;
    }

    set(n : number) {
        this.value = n;
        this.isDead = false;
    }

    take(n : number) {
        this.value -= n;

        if (this.value <= 0 && !this.isDead) {
            this.isDead = true;
            this.#eventHandler.fire(HealthEvent.DEATH);
        }
    }


    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.health = this;
    }

    on(event_type : HealthEvent, callback : Listener) {
        this.#eventHandler.add(event_type, callback);
    }

    off(event : HealthEvent, callback : Listener) {
        this.#eventHandler.remove(event, callback);
    }
}
