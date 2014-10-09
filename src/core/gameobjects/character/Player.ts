/// <reference path="../../Entity.ts" />
/// <reference path="../gear/Gun.ts" />
/// <reference path="../../../lib/controllers/InputController.ts" />

class Player extends Entity {
    speed = 24;
    input : InputController;
    camera : Camera;
    weapon : Gun;
    gunPlacementOffset = new Vector(38, 0); //TODO: hmmm..

    constructor(position, width, height, img, input : InputController, camera : Camera, gun : Gun) {
        super(position, width, height, img);
        this.input = input;
        this.camera = camera;
        this.weapon = gun;
    }

    update(dt : number) {
        this.pos.rotateDirection(new Vector(0,0).copy(this.camera.view).reverse().offset(this.input.getPointerPos())); //TODO: optimize

        var movement = new Vector(0,0);

        if(this.input.isDown(InputAction.LEFT)) movement.x -= 1;
        if(this.input.isDown(InputAction.RIGHT)) movement.x += 1;
        if(this.input.isDown(InputAction.UP)) movement.y -= 1;
        if(this.input.isDown(InputAction.DOWN)) movement.y += 1;

        movement.normalize();

        movement.x *= this.speed * dt;
        movement.y *= this.speed * dt;

        this.pos.x += movement.x;
        this.pos.y += movement.y;

        if(this.input.isDown(InputAction.ACTION_1)) {
            this.weapon.attack();
        }
        this.weapon.pos.copy(this.pos).offset(this.gunPlacementOffset);
        this.weapon.pos.rotate(this.pos);

        //this.weapon.update(dt);
    }
}