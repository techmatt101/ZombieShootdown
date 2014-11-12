class CollisionSystem implements ISystem {
    private _entities : Entity[] = [];


    add (entity : Entity) {
        if(entity.components.has(Collision)) {
            this._entities.push(entity);
        }
    }

    update (dt : number) {
        for (var i = 0; i < this._entities.length; i++) {
            if(!this._entities[i].components.hasActive(Collision)) { continue; }
            var collision = this._entities[i].components.collision;

            for (var ii = i + 1; ii < this._entities.length; ii++) {
                if(!this._entities[ii].components.hasActive(Collision)) { continue; }
                collision.test(this._entities[ii].components.collision);
            }
        }
    }
}