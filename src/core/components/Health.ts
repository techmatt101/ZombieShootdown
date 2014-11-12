class Health implements IComponent, IObserver {
    health : number;

    private _eventHandler = new EventHandler<HealthEvents>();


    constructor(health : number = 100) {
        this.health = health;
    }

    on (event_type : HealthEvents, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off () {
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}

enum HealthEvents {
    DEATH
}