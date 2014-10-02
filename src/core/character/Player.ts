/// <reference path="../Entity.ts" />
/// <reference path="../gear/Gun.ts" />
/// <reference path="../../lib/controllers/InputController.ts" />

class Player extends Entity {
    weapon : Gun;
    gunPlacementOffset = new Vector(50, 0);

    constructor(position, width, height, img, gun : Gun) {
        super(position, width, height, img);
        this.weapon = gun;
    }

    update(dt : number) {
        this.pos.rotateDirection(Input.getPointerPos());

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

        if(Input.isDown(InputAction.ACTION_1)) {
            this.weapon.attack();
        }
        this.weapon.pos.offsetCopy(this.pos, this.gunPlacementOffset);
        this.weapon.pos.rotate(this.pos);

        this.weapon.update(dt);
    }
}