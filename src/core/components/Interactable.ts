import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { InteractionBehaviourList } from '../InteractionBehaviourList';

export class Interactable implements IComponent {
    active = true;
    behaviours : InteractionBehaviourList = {};

    static reference(components : IComponentDirectory) {
        return components.interactable;
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.interactable = this;
    }
}
