import { WeaponHolder } from '../components/WeaponHolder';
import { Entity } from '../Entity';
import type { IWeapon } from '../gameobjects/IWeapon';

export class WeaponiseDecorator {
    static giveGun(entity : Entity, weapon : IWeapon) {
        entity.addComponent(new WeaponHolder(entity.pos, weapon));
        entity.build();
    }
}
