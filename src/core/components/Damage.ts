class Damage implements IComponent {
    active : boolean;
    value : number;

    static reference(components : IComponentDirectory) {
        return components.damage;
    }

    constructor(damage : number = 10) {
        this.value = damage;
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.damage = this;
    }
}