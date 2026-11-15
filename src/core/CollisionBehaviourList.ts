import type { DamageCollisionBehavior } from './behaviours/DamageCollisionBehavior';

export interface CollisionBehaviourList {
    zombieDamage? : DamageCollisionBehavior;
    playerDamage? : DamageCollisionBehavior;
}
