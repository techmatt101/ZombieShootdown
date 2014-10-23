class Gun extends Entity implements IWeapon {
    bullets : Bullet[] = [];
    nextBullet = 0;
    coolDown = 2;
    activeCoolDown = -1;
    collision = false;
    gunPlacementOffset = new Vector(38, 0); //TODO: hmmm..


    constructor(position, width, height, img, bullets) {
        super(position, width, height, img);
        this.bullets = bullets;
    }

    update (dt : number) {
        super.update(dt);
        if(this.activeCoolDown > 0) {
            this.activeCoolDown -= dt;
        } else {
            this.activeCoolDown = 0;
        }
    }

    attack () {
        if(this.activeCoolDown === 0) {
            if(this.nextBullet >= this.bullets.length) {
                this.nextBullet = 0;
            }
            this.bullets[this.nextBullet].active = true;
            this.bullets[this.nextBullet].pos.copy(this.pos);
            this.nextBullet++;
            this.activeCoolDown = this.coolDown;
        }
    }
}