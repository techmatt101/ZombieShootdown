/// <reference path="../../Entity.ts" />

class Bullet extends Entity {
    speed = 80;
    active = false;


    update (dt : number) {
        super.update(dt);
        if(this.active === false) {
            return;
        }
        if(this.pos.x < 0 || this.pos.x > 1200 || this.pos.y < 0 || this.pos.y > 650) {
            this.active = false;
            return;
        }
        this.pos.traject(this.speed * dt);
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if(this.active) {
            super.drawDebug(ctx);
        }
    }
}