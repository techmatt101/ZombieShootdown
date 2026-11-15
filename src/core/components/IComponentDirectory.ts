import { AI } from './AI';
import { Collision } from './Collision';
import { Damage } from './Damage';
import { Health } from './Health';
import { InputControl } from './InputControl';
import { Material } from './Material';
import { Movement } from './Movement';
import { Pointer } from './Pointer';
import { SpriteAnimator } from './SpriteAnimator';
import { WeaponHolder } from './WeaponHolder';

export interface IComponentDirectory {
    controller? : InputControl;
    ai? : AI;
    collision? : Collision;
    material? : Material;
    movement? : Movement;
    health? : Health;
    damage? : Damage;
    weaponHolder? : WeaponHolder;
    spriteAnimator? : SpriteAnimator;
    pointer? : Pointer;
}
