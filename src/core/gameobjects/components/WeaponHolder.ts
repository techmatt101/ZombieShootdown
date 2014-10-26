class WeaponHolder implements IComponent {
    private _pos : Vector;
    private _weapon : IWeapon;


    constructor(pos: Vector, weapon : IWeapon) {
        this._pos = pos;
        this._weapon = weapon;
    }

    attack() {
        this._weapon.attack();
    }

    update (dt : number) : void {
        this._weapon.pos.copy(this._pos).offset(this._weapon.placementOffset);
        this._weapon.pos.rotate(this._pos);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}