/// <reference path="../../Entity.ts" />

class Zombie extends Entity implements ICharacter{
    speed = 5;
    health = 5;
    isDead = false;

    update (dt : number) {
        this.lastPos.copy(this.pos);
        if(this.controller !== null && !this.isDead) {
            this.controller.update(dt);
        }
    }

    onCollision(colliedEntity : Entity) {
        console.log(colliedEntity)
        if(!this.isDead && colliedEntity instanceof Bullet) {
            this.health--;
            if(this.health < 0) {
                this.isDead = true;
                this.pos.x = 100;
                this.pos.y = 0;
            }
        }
    }
}