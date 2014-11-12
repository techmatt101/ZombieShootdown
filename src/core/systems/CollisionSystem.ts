class CollisionSystem implements ISystem {
    private _entities : Entity[] = [];


    add (entity : Entity) {
        if(entity.components.has(Collision) && (entity.id === 'Player' || entity.id === 'Zombie') || entity.id === 'Bullet') {
            this._entities.push(entity);
        }
    }

    update (dt : number) {
        for (var i = 0; i < this._entities.length; i++) {
            if(!this._entities[i].active) { continue; }  //TODO: hmmm...
            var collision = <Collision> (<any>this._entities[i].components).Collision; //TODO: hmmm...
            for (var ii = i + 1; ii < this._entities.length; ii++) {
                if(!this._entities[ii].active) { continue; }  //TODO: hmmm...
                collision.test( <Collision> (<any>this._entities[ii].components).Collision); //TODO: hmmm...
            }
        }
    }
}