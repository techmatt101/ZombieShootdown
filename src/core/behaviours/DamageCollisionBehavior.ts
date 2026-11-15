import type { IBehavior } from './IBehavior';
import type { Damage } from '../components/Damage';
import type { Health } from '../components/Health';

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
        const damage = this.#damage;
        if (damage !== null && damage.isReady) {
            opposingBehavior.reaction(damage.value);
            damage.dealt();
        }
    }

    reaction(damage : number) {
        this.#heath?.take(damage);
    }
}
