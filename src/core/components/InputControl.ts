import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { WeaponHolder } from './WeaponHolder';
import { Entity } from '../Entity';
import { InputAction } from '../../lib/controllers/InputAction';
import { InputState } from '../../lib/controllers/InputState';

export class InputControl implements IComponent {
    active = true;

    #entity : Entity;
    #input : InputState;

    static reference(components : IComponentDirectory) {
        return components.controller;
    }

    constructor(entity : Entity, input : InputState) {
        this.#entity = entity;
        this.#input = input;
    }

    setEntity(entity : Entity) {
        this.#entity = entity;
    }

    update(dt : number) {
        this.#entity.components.movement?.direction.copy(this.#input.movementCoordinates);
        if(this.#input.directionCoordinates.x !== 0 || this.#input.directionCoordinates.y !== 0) {
            this.#entity.pos.direction = Math.atan2(this.#input.directionCoordinates.y, this.#input.directionCoordinates.x);
        }

        if (this.#input.isKeyDown(InputAction.ACTION_1) && this.#entity.hasActiveComponent(WeaponHolder)) {
            this.#entity.components.weaponHolder?.attack();
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.controller = this;
    }
}
