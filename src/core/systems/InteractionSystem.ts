import { Interactable } from '../components/Interactable';
import { Interactor } from '../components/Interactor';
import type { Entity } from '../Entity';
import type { InteractionBehaviourList } from '../InteractionBehaviourList';
import type { ISystem } from './ISystem';
import { distanceToBox } from '../../lib/geometry/overlap';

export class InteractionSystem implements ISystem<Entity> {
    #interactors : Entity[] = [];
    #interactables : Entity[] = [];

    add(entity : Entity) {
        if (entity.hasComponent(Interactor)) {
            this.#interactors.push(entity);
        }
        if (entity.hasComponent(Interactable)) {
            this.#interactables.push(entity);
        }
    }

    update(dt : number) {
        const interactors = this.#interactors;
        for (let i = 0; i < interactors.length; i++) {
            const actor = interactors[i];
            if (!actor.hasActiveComponent(Interactor)) continue;

            const interactor = actor.getComponent('interactor');
            interactor.target = this.#nearestInReach(actor, interactor.reach);
            if (interactor.wantsToInteract && interactor.target !== null) {
                this.#applyBehaviours(interactor.behaviours, interactor.target.getComponent('interactable').behaviours);
            }
        }
    }

    #nearestInReach(actor : Entity, reach : number) : Entity | null {
        const interactables = this.#interactables;
        let nearest : Entity | null = null;
        let nearestDistance = reach;
        for (let i = 0; i < interactables.length; i++) {
            const candidate = interactables[i];
            if (!candidate.hasActiveComponent(Interactable)) continue;
            const distance = distanceToBox(candidate.geometry, actor.pos);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearest = candidate;
            }
        }
        return nearest;
    }

    #applyBehaviours(ours : InteractionBehaviourList, theirs : InteractionBehaviourList) {
        const keys = Object.keys(ours) as Array<keyof InteractionBehaviourList>;
        for (let i = 0; i < keys.length; i++) {
            const our = ours[keys[i]], their = theirs[keys[i]];
            if (our === undefined || their === undefined) continue;
            if (our.dominant && their.passive) {
                our.action(their);
            }
            if (their.dominant && our.passive) {
                their.action(our);
            }
        }
    }
}
