class WeaponHolder implements IComponent {
    active = true;

    private _pos : Point;
    private _weapon : IWeapon;

    static reference(components : IComponentDirectory) {
        return components.weaponHolder;
    }

    constructor(pos : Point, weapon : IWeapon) {
        this._pos = pos;
        this._weapon = weapon;
    }

    attack() {
        this._weapon.attack();
    }

    update(dt : number) : void {
        this._weapon.pos.copy(this._pos).offset(this._weapon.placementOffset);
        this._weapon.pos.rotate(this._pos);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.weaponHolder = this;
    }
}