class Health implements IComponent, IObserver {
    active : boolean;
    total : number;

    private _eventHandler = new EventHandler<HealthEvents>();

    static reference(components : Components) {
        return components.health;
    }

    constructor(health : number = 100) {
        this.total = health;
    }

    give(n : number) {
        this.total += n;
    }

    take(n : number) {
        this.total -= n;

        if(this.total <= 0) {
            this._eventHandler.fire(HealthEvents.DEATH);
        }
    }


    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    load (components : Components) {
        components.health = this;

        if(components.has(Collision)) { //TODO: HACK!
            var self = this;
            components.collision.on(CollisionEvents.COLLIDE, () => {
                if(self.total > 0) {
                    self.take(30);
                }
            });
        }
    }

    on (event_type : HealthEvents, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off () {
    }
}

enum HealthEvents {
    DEATH
}