module ZombieApp {
    export class AISystem implements ISystem {
        private _entities : Entity[] = [];
        private _map : MapManager;
        private _index = 0;


        constructor(map : MapManager) {
            this._map = map;
        }

        add(entity : Entity) {
            if (entity.hasComponent(AI)) {
                this._entities.push(entity);
            }
        }

        update(dt : number) {
            this._entities[this._index].components.ai.getAI().updatePathFind(this._map.segments);
            this._index++;
            if (this._index >= this._entities.length) {
                this._index = 0;
            }
        }
    }
}