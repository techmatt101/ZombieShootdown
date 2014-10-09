/// <reference path="../../Entity.ts" />
/// <reference path="../gear/Gun.ts" />
/// <reference path="../../../lib/controllers/InputController.ts" />

class Player extends Entity {
    speed = 24;
    weapon : Gun;
    gunPlacementOffset = new Vector(25, 0);

    constructor(position, width, height, img, gun : Gun) {
        super(position, width, height, img);
        this.weapon = gun;
    }

    update(dt : number) {
        this.pos.rotateDirection(Input.getPointerPos());

        var movement = new Vector(0,0);

        if(Input.isDown(InputAction.LEFT)) movement.x -= 1;
        if(Input.isDown(InputAction.RIGHT)) movement.x += 1;
        if(Input.isDown(InputAction.UP)) movement.y -= 1;
        if(Input.isDown(InputAction.DOWN)) movement.y += 1;

        movement.normalize();

        movement.x *= this.speed * dt;
        movement.y *= this.speed * dt;

        this.pos.x += movement.x;
        this.pos.y += movement.y;

        if(Input.isDown(InputAction.ACTION_1)) {
            this.weapon.attack();
        }
        this.weapon.pos.offsetCopy(this.pos, this.gunPlacementOffset);
        this.weapon.pos.rotate(this.pos);

        //this.weapon.update(dt);
    }
}