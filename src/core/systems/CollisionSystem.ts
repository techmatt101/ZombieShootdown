import { Collision } from '../components/Collision';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export class CollisionSystem implements ISystem<Entity> {
    #entities : Entity[] = [];


    add(entity : Entity) {
        if (entity.hasComponent(Collision)) {
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        for (let i = 0; i < this.#entities.length; i++) {
            const entity1Collision = this.#entities[i].components.collision;
            if (!entity1Collision || !this.#entities[i].hasActiveComponent(Collision)) {
                continue;
            }

            for (let ii = i + 1; ii < this.#entities.length; ii++) {
                const entity2Collision = this.#entities[ii].components.collision;
                if (!entity2Collision || !this.#entities[ii].hasActiveComponent(Collision)) {
                    continue;
                }

                if (entity1Collision.test(entity2Collision)) {
                    entity1Collision.setAsCollided();
                    entity2Collision.setAsCollided();

                    entity1Collision.testBehaviours(entity2Collision);

                    const offset = entity1Collision.getBoundary().getOffset(entity2Collision.getBoundary());

                    if (this.#entities[i].hasActiveComponent(Movement) && this.#entities[ii].hasActiveComponent(Movement)) {
                        offset.scale(0.5);
                    }

                    if (this.#entities[i].hasActiveComponent(Movement)) {
                        this.#entities[i].pos.add(offset);
                    }

                    if (this.#entities[ii].hasActiveComponent(Movement)) {
                        this.#entities[ii].pos.sub(offset);
                    }
                }
            }
        }
    }
}
