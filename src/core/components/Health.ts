module ZombieApp {
    export class Health implements IComponent<ComponentList>, IObserver {
        active : boolean;
        value : number;
        isDead = false;

        private _eventHandler = new EventHandler<HealthEvents>();

        static reference(components : ComponentList) {
            return components.health;
        }

        constructor(health : number = 100) {
            this.value = health;
        }

        set(n : number) {
            this.isDead = false;
        }

        give(n : number) {
            this.value += n;
        }

        take(n : number) {
            this.value -= n;

            if (this.value <= 0 && !this.isDead) {
                this.isDead = true;
                this._eventHandler.fire(HealthEvents.DEATH);
            }
        }


        update(dt : number) : void {
        }

        drawDebug(ctx : CanvasRenderingContext2D) : void {
        }

        build(components : ComponentList) {
            components.health = this;
        }

        on(event_type : HealthEvents, callback) {
            this._eventHandler.add(event_type, callback);
        }

        off() {
        }
    }
}

module ZombieApp {
    export enum HealthEvents {
        DEATH
    }
}