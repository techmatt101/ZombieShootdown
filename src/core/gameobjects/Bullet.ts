class Bullet extends Entity implements IPool {
    available = false;

    reset () {
    }

    update (dt : number) {
        if(!this.available && (<Collision>this.components.get(Collision)).isTouching) { //TODO: fix bug were it is still touching from last use
            this.available = true;
        }

        super.update(dt);
    }
}