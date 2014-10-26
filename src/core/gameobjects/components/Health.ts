class Health implements IComponent {
    health : number;

    constructor(health : number = 100) {
        this.health = health;
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}