class WeaponiseDecorator {
    static giveGun(entity : Entity, weapon : IWeapon) {
        entity.addComponent(new WeaponHolder(entity.pos, weapon));
        entity.build();
    }
}