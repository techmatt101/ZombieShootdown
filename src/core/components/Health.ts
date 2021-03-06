enum HealthEvent {
    DEATH
}

class Health implements IComponent, IObserver {
    active : boolean;
    value : number;
    isDead = false;

    private _eventHandler = new EventHandler<HealthEvent>();

    static reference(components : IComponentDirectory) {
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
            this._eventHandler.fire(HealthEvent.DEATH);
        }
    }


    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.health = this;
    }

    on(event_type : HealthEvent, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off() {
    }
}