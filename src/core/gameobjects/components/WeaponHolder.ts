class WeaponHolder implements IComponent {
    weapon : Gun;

    constructor(weapon : Gun) {
        this.weapon = weapon;
    }

    bind(attrs : Components) {
        attrs.weapon = this;
    }

    update (dt : number) : void {
        this.weapon.update(dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}