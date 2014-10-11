/// <reference path="../../Entity.ts" />

class Zombie extends Entity implements ICharacter{
    speed = 5;
    health = 5;
    isDead = false;

    update (dt : number) {
        if(this.controller !== null && !this.isDead) {
            this.controller.update(dt);
        }
    }

    onCollision() {
        if(!this.isDead) {
            this.health--;
            if(this.health < 0) {
                this.isDead = true;
            }
        }
    }
}