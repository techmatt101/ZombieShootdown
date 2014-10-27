class Gun extends Entity implements IWeapon {
    placementOffset = new Vector(38, 0);
    private _bullets : Entity[];
    private _nextBullet = 0;
    private _coolDown = 2;
    private _activeCoolDown = 0;


    constructor(id : string, geometry : IShape, texture : Texture, bullets : Entity[]) {
        super(id, geometry, texture);
        this._bullets = bullets;
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
            if(this._nextBullet >= this._bullets.length) {
                this._nextBullet = 0;
            }
            //this._bullets[this._nextBullet].active = true;
            this._bullets[this._nextBullet].pos.copy(this.pos);
            this._nextBullet++;
            this._activeCoolDown = this._coolDown;
        }
    }
}