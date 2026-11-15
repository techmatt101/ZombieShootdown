import type { FakeChunkSource } from './worldFixtures';
import type { Entity } from '../core/Entity';
import { TopDownLevel } from '../core/level/TopDownLevel';
import { Systems } from '../core/Systems';
import { Camera } from '../lib/Camera';
import { TileMap } from '../world/TileMap';

export const SCREEN_CENTRE = { x: 600, y: 300 };

export function levelOn(chunks : FakeChunkSource) {
    const tileMap = new TileMap(chunks);
    const camera = new Camera(SCREEN_CENTRE);
    const systems = new Systems<Entity>();
    const level = new TopDownLevel(chunks, tileMap, camera, systems);
    return { level, tileMap, camera, systems, chunks };
}
