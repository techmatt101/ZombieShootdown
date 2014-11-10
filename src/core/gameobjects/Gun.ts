class Gun extends Entity implements IWeapon {
    placementOffset = new Vector(38, 0);
    private _bulletPool : Pool<Bullet>;
    private _coolDown = 2;
    private _activeCoolDown = 0;


    constructor(id : string, geometry : Box, bulletPool : Pool<Bullet>) {
        super(id, geometry);
        this._bulletPool = bulletPool;
    }

    update (dt : number) {
        super.update(dt);
        if(this._activeCoolDown > 0) {
            this._activeCoolDown -= dt;
        } else {
            this._activeCoolDown = 0;
        }
    }

    attack () {
        if(this._activeCoolDown === 0) {
            this._bulletPool.acquire().pos.copy(this.pos);
            this._activeCoolDown = this._coolDown;
        }
    }
}