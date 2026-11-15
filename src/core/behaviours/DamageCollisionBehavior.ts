import type { IBehavior } from './IBehavior';
import { Damage } from '../components/Damage';
import { Health } from '../components/Health';

export class DamageCollisionBehavior implements IBehavior {
    dominant = false;
    passive = false;

    #damage : Damage | null = null;
    #heath : Health | null = null;


    inflictDamage(damage : Damage) {
        this.#damage = damage;
        this.dominant = true;

        return this;
    }

    acceptDamage(health : Health) {
        this.#heath = health;
        this.passive = true;

        return this;
    }

    action(opposingBehavior : IBehavior) {
        if (this.#damage !== null) {
            opposingBehavior.reaction(this.#damage.value);
        }
    }

    reaction(damage : number) {
        this.#heath?.take(damage);
    }
}
