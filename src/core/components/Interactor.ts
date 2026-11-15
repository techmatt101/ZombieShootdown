import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Entity } from '../Entity';
import type { InteractionBehaviourList } from '../InteractionBehaviourList';
import { InputAction } from '../../lib/controllers/InputAction';
import { InputState } from '../../lib/controllers/InputState';
import { TILE_SIZE } from '../../world/constants';

export class Interactor implements IComponent {
    active = true;
    reach = TILE_SIZE;
    behaviours : InteractionBehaviourList = {};
    target : Entity | null = null;
    wantsToInteract = false;

    #input : InputState;
    #wasHoldingInteract = false;

    static reference(components : IComponentDirectory) {
        return components.interactor;
    }

    constructor(input : InputState) {
        this.#input = input;
    }

    update(dt : number) {
        const isHoldingInteract = this.#input.isKeyDown(InputAction.INTERACT);
        this.wantsToInteract = isHoldingInteract && !this.#wasHoldingInteract;
        this.#wasHoldingInteract = isHoldingInteract;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.interactor = this;
    }
}
