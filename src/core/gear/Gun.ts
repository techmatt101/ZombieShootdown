/// <reference path="../Entity.ts" />
/// <reference path="Bullet.ts" />
/// <reference path="IWeapon.ts" />

class Gun extends Entity implements IWeapon {
    bullets : Bullet[] = [];
    coolDown = 5;
    activeCoolDown = -1;


    constructor(position, width, height, img) {
        super(position, width, height, img);

        for (var i = 0; i < 20; i++) {
            this.bullets.push(new Bullet(position, width, height, img));
        }
    }

    update (dt : number) {
        if(this.activeCoolDown > 0) {
            this.activeCoolDown -= dt;
        } else {
            this.activeCoolDown = 0;
        }
    }

    attack () {
        if(this.activeCoolDown === 0) {
            console.log("POW");
            this.activeCoolDown = this.coolDown;
        }
    }
}