/// <reference path="../../Entity.ts" />
/// <reference path="../gear/Gun.ts" />
/// <reference path="ICharacter.ts" />
/// <reference path="../../../lib/controllers/InputController.ts" />

class Player extends Entity implements ICharacter{
    speed = 24;
    health = 100;
    weapon : Gun;


    constructor(position, width, height, img, gun : Gun) {
        super(position, width, height, img);
        this.weapon = gun;
    }

    update(dt : number) {
        super.update(dt);
        this.weapon.pos.copy(this.pos).offset(this.weapon.gunPlacementOffset);
        this.weapon.pos.rotate(this.pos);

        //this.weapon.update(dt);
    }
}