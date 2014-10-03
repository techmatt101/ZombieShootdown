/// <reference path="../../Entity.ts" />

class Bullet extends Entity {
    speed = 5;


    update (dt : number) {
        this.pos.traject(this.speed * dt);
    }
}