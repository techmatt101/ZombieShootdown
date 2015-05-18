class DamageCollisionBehavior implements IBehavior {
    dominant = false;
    passive = false;

    private _damage : Damage;
    private _heath : Health;


    inflictDamage(damage : Damage) {
        this._damage = damage;
        this.dominant = true;

        return this;
    }

    acceptDamage(health : Health) {
        this._heath = health;
        this.passive = true;

        return this;
    }

    action(opposingBehavior : IBehavior) {
        opposingBehavior.reaction(this._damage.value);
    }

    reaction(damage) {
        this._heath.take(damage);
    }
}