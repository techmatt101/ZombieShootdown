class CollisionSystem implements ISystem<Entity> {
    private _entities : Entity[] = [];


    add(entity : Entity) {
        if (entity.hasComponent(Collision)) {
            this._entities.push(entity);
        }
    }

    update(dt : number) {
        for (var i = 0; i < this._entities.length; i++) {
            if (!this._entities[i].hasActiveComponent(Collision)) {
                continue;
            }
            var entity1Collision = this._entities[i].components.collision;

            for (var ii = i + 1; ii < this._entities.length; ii++) {
                if (!this._entities[ii].hasActiveComponent(Collision)) {
                    continue;
                }
                var entity2Collision = this._entities[ii].components.collision;

                if (entity1Collision.test(entity2Collision)) {
                    entity1Collision.setAsCollided();
                    entity2Collision.setAsCollided();

                    entity1Collision.testBehaviours(entity2Collision);

                    var offset = entity1Collision.getBoundary().getOffset(entity2Collision.getBoundary());

                    if (this._entities[i].hasActiveComponent(Movement) && this._entities[ii].hasActiveComponent(Movement)) {
                        offset.scale(0.5);
                    }

                    if (this._entities[i].hasActiveComponent(Movement)) {
                        this._entities[i].pos.add(offset);
                    }

                    if (this._entities[ii].hasActiveComponent(Movement)) {
                        this._entities[ii].pos.sub(offset);
                    }
                }
            }
        }
    }
}