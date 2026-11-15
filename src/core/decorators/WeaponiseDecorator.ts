import { WeaponHolder } from '../components/WeaponHolder';
import { Entity } from '../Entity';
import type { IWeapon } from '../gameobjects/IWeapon';

export function giveGun(entity : Entity, weapon : IWeapon) {
    entity.addComponent(new WeaponHolder(entity.pos, weapon));
    entity.build();
}
