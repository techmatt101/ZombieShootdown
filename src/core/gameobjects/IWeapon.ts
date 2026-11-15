import type { Entity } from '../Entity';
import type { Vector } from '../../lib/geometry/Vector';

export interface IWeapon extends Entity {
    placementOffset : Vector
    attack() : void
}
