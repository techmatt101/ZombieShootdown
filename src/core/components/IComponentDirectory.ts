import type { AI } from './AI';
import type { Collision } from './Collision';
import type { Damage } from './Damage';
import type { Health } from './Health';
import type { InputControl } from './InputControl';
import type { Door } from './Door';
import type { Interactable } from './Interactable';
import type { Interactor } from './Interactor';
import type { Light } from './Light';
import type { Material } from './Material';
import type { Movement } from './Movement';
import type { MuzzleFlash } from './MuzzleFlash';
import type { Pointer } from './Pointer';
import type { SpriteAnimator } from './SpriteAnimator';
import type { WeaponHolder } from './WeaponHolder';

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
    interactor? : Interactor;
    interactable? : Interactable;
    door? : Door;
    muzzleFlash? : MuzzleFlash;
    light? : Light;
}
