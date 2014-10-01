/// <reference path="../Entity.ts" />
/// <reference path="../../lib/controllers/InputController.ts" />

class Player extends Entity {
    acceleration = 0.8;
    speed = 0;
    maxSpeed = 24;


    update(dt : number) {
        this.pos.rotateDirection(Input.getPoiterPos());

        if (Input.isDown(InputAction.LEFT)) {
            this.speed -= this.acceleration;
        } else if (Input.isDown(InputAction.RIGHT)) {
            this.speed += this.acceleration;
        }

        if(this.speed > 0) {
            this.speed -= this.acceleration / 2;
        } else {
            this.speed += this.acceleration / 2;
        }

        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        } else if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        }

        this.pos.x += ~~this.speed * dt;

        if (Input.isDown(InputAction.UP)) {
            this.pos.y -= 24 * dt;
        } else if (Input.isDown(InputAction.DOWN)) {
            this.pos.y += 24 * dt;
        }

        if (Input.isDown(InputAction.LEFT)) {
            this.pos.x -= 24 * dt;
        } else if (Input.isDown(InputAction.RIGHT)) {
            this.pos.x += 24 * dt;
        }
    }
}