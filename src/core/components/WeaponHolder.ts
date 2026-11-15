import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { IWeapon } from '../gameobjects/IWeapon';
import type { Point } from '../../lib/geometry/Point';

export class WeaponHolder implements IComponent {
    active = true;

    #pos : Point;
    #weapon : IWeapon;

    static reference(components : IComponentDirectory) {
        return components.weaponHolder;
    }

    constructor(pos : Point, weapon : IWeapon) {
        this.#pos = pos;
        this.#weapon = weapon;
    }

    attack() {
        this.#weapon.attack();
    }

    update(dt : number) : void {
        this.#weapon.pos.copy(this.#pos).offset(this.#weapon.placementOffset);
        this.#weapon.pos.rotate(this.#pos);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.weaponHolder = this;
    }
}
