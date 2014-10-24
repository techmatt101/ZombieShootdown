class Health implements IAttr {
    health : number;

    constructor(health : number = 100) {
        this.health = health;
    }

    create (entity : Entity) {
        entity.attr.health = this;
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}