import { Entity } from '../Entity';
import { Vector } from '../../lib/geometry/Vector';

export interface IWeapon extends Entity {
    placementOffset : Vector
    attack() : void
}
