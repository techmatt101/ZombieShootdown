import type { IBehavior } from './IBehavior';
import type { Door } from '../components/Door';
import type { Entity } from '../Entity';

export class DoorInteractionBehavior implements IBehavior<Entity> {
    dominant = false;
    passive = false;

    #opener : Entity | null = null;
    #door : Door | null = null;


    openDoorsAs(opener : Entity) {
        this.#opener = opener;
        this.dominant = true;

        return this;
    }

    beOpenedBy(door : Door) {
        this.#door = door;
        this.passive = true;

        return this;
    }

    action(opposingBehavior : IBehavior<Entity>) {
        if (this.#opener !== null) {
            opposingBehavior.reaction(this.#opener);
        }
    }

    reaction(opener : Entity) {
        this.#door?.toggle(opener);
    }
}
