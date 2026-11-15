import { DamageCollisionBehavior } from './behaviours/DamageCollisionBehavior';

// Fields are `declare`d so they only exist once assigned: Collision.buildBehaviours()
// enumerates the keys an entity actually has.
export class CollisionBehaviourList {
    declare zombieDamage? : DamageCollisionBehavior;
    declare playerDamage? : DamageCollisionBehavior;
}
