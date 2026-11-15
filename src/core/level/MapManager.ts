import { spawnTile } from '../factories/TileFactory';
import { MapGenerator } from '../tilemap/MapGenerator';
import { Tile, TileType } from '../tilemap/Tile';
import { Canvas } from '../../lib/Canvas';
import { Box } from '../../lib/geometry/Box';
import { Vector } from '../../lib/geometry/Vector';
import type { Segment } from '../../lib/geometry/Segment';
import type { IUpdate } from '../../lib/IUpdate';
import type { Level } from './Level';

export class MapManager extends Box implements IUpdate {
    mapGenerator : MapGenerator | null = null;
    segments : Segment[] = [];
    #canvas : Canvas;


    constructor(pos : Vector, width : number, height : number, canvas : Canvas) {
        super(width, height, pos);
        this.#canvas = canvas;
    }

    getGenerator() : MapGenerator {
        if (this.mapGenerator === null) {
            throw new Error('Map has not been loaded');
        }
        return this.mapGenerator;
    }

    loadMap(level : Level) {
        const mg = new MapGenerator();
        mg.generate(new Vector(42, 42), new Vector(this.width, this.height), 8, 4);
        this.mapGenerator = mg;

        this.segments = [
            // Border
            { a: { x: 0, y: 0 }, b: { x: this.width, y: 0 } },
            { a: { x: this.width, y: 0 }, b: { x: this.width, y: this.height } },
            { a: { x: this.width, y: this.height }, b: { x: 0, y: this.height } },
            { a: { x: 0, y: this.height }, b: { x: 0, y: 0 } },
        ];

        mg.getGird().loopThrough((tile : Tile, pos : Vector, tileSize : Vector) => {
            if (tile.type !== TileType.EMPTY) {
                const entityTile = spawnTile(pos, tileSize, tile);
                level.addEntity(entityTile);

                if (tile.type === TileType.WALL && entityTile.pos.x !== 0 && entityTile.pos.y !== 0 && entityTile.pos.x !== 928 && entityTile.pos.y !== 992) { //TODO: SUPER HACK
                    this.segments.push(...entityTile.geometry.toPolygon());
                }
            }
        });
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
