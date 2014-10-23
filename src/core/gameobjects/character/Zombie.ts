class Zombie extends Entity implements ICharacter{
    speed = 5;
    health = 20;
    isDead = false;

    update (dt : number) {
        this.lastPos.copy(this.pos);
        if(this.controller !== null && !this.isDead) {
            this.controller.update(dt);
        }
    }

    onCollision(colliedEntity : Entity) {
        if(!this.isDead && colliedEntity instanceof Bullet) {
            this.health -= (<Bullet>colliedEntity).damage;
            if(this.health < 0) {
                this.isDead = true;
                this.pos.x = 100;
                this.pos.y = 0;
            }
        }
    }
}