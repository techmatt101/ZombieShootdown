import { describe, expect, it } from 'vitest';
import { ZombieAI } from './ZombieAI';
import { AI } from '../components/AI';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { AISystem } from '../systems/AISystem';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { TileMap } from '../../world/TileMap';

const centre = (tile : number) => (tile + 0.5) * TILE_SIZE;

function setUp(rows : string[], zombieTile : [number, number], playerTile : [number, number]) {
    const tileMap = new TileMap(chunksFromRows(rows));
    const player = new Entity('Player', new Point(centre(playerTile[0]), centre(playerTile[1]), 0), new Box(48, 48));
    const zombie = new Entity('Zombie', new Point(centre(zombieTile[0]), centre(zombieTile[1]), 0), new Box(48, 48));
    const movement = zombie.addComponent(new Movement(zombie.pos, 20, 1));
    const ai = new ZombieAI(zombie, player, 20);
    zombie.addComponent(new AI(ai));
    zombie.build();
    return { tileMap, player, zombie, movement, ai };
}

describe('ZombieAI', () => {
    it('chases at its own chase speed when it can see the player', () => {
        const { tileMap, zombie, movement, ai } = setUp(['......'], [0, 0], [5, 0]);
        ai.think(tileMap);
        ai.update(1);
        expect(movement.speed).toBe(20);
        expect(movement.direction.x).toBeGreaterThan(0);
        expect(zombie.pos.direction).toBeCloseTo(0);
    });

    it('wanders slowly to nearby open floor when the player is hidden', () => {
        const rows = ['.......#......', '.......#......', '.......#......', '.......#......', '.......#......', '.......#......', '.......#......'];
        const { tileMap, movement, ai } = setUp(rows, [3, 3], [12, 3]);
        ai.think(tileMap);
        ai.update(1);
        expect(movement.speed).toBe(3);
    });

    it('forgets what it saw when reused from a pool', () => {
        const { tileMap, movement, ai } = setUp(['......'], [0, 0], [5, 0]);
        ai.think(tileMap);
        ai.reset();
        ai.update(1);
        expect(movement.speed).toBe(3);
    });
});

describe('AISystem', () => {
    it('lets a limited number of active zombies think each frame, in turn', () => {
        const tileMap = new TileMap(chunksFromRows(['......']));
        const thoughts : number[] = [];
        const system = new AISystem(tileMap);
        for (let i = 0; i < 10; i++) {
            const zombie = new Entity('Zombie', new Point(0, 0, 0), new Box(1, 1));
            zombie.addComponent(new AI({ think: () => thoughts.push(i), update() {}, reset() {} }));
            zombie.build();
            if (i === 3) zombie.active = false;
            system.add(zombie);
        }
        system.update(1);
        expect(thoughts).toEqual([0, 1, 2, 4, 5, 6, 7, 8]);
        system.update(1);
        expect(thoughts.slice(8)).toEqual([9, 0, 1, 2, 4, 5, 6, 7]);
    });
});
