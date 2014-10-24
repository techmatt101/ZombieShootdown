class WeaponHolder implements IAttr {
    weapon : Gun;

    constructor(weapon : Gun) {
        this.weapon = weapon;
    }

    create (entity : Entity) {
        entity.attr.weapon = this;
    }

    update (dt : number) : void {
        this.weapon.update(dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}