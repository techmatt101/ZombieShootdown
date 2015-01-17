module ZombieApp {
    export class Gun extends Entity implements IWeapon {
        placementOffset = new Vector(32, 0);
        private _bulletPool : Pool<Entity>;
        private _coolDown = 1.5;
        private _activeCoolDown = 0;


        constructor(id : string, geometry : Box, bulletPool : Pool<Entity>) {
            super(id, geometry);
            this._bulletPool = bulletPool;
        }

        update(dt : number) {
            super.update(dt);
            if (this._activeCoolDown > 0) {
                this._activeCoolDown -= dt;
            } else {
                this._activeCoolDown = 0;
            }
        }

        attack() {
            if (this._activeCoolDown === 0) {
                this._bulletPool.acquire().pos.copy(this.pos);
                this._activeCoolDown = this._coolDown;
            }
        }
    }
}