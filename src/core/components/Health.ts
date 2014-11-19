class Health implements IComponent, IObserver {
    active : boolean;
    value : number;

    private _eventHandler = new EventHandler<HealthEvents>();

    static reference(components : ComponentList) {
        return components.health;
    }

    constructor(health : number = 100) {
        this.value = health;
    }

    give(n : number) {
        this.value += n;
    }

    take(n : number) {
        this.value -= n;

        if(this.value <= 0) {
            this._eventHandler.fire(HealthEvents.DEATH);
        }
    }


    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    load (components : ComponentList) {
        components.health = this;
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