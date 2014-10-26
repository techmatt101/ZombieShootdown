class WeaponHolder implements IComponent {
    private _weapon : IWeapon;


    constructor(weapon : IWeapon) {
        this._weapon = weapon;
    }

    attack() {
        this._weapon.attack();
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}