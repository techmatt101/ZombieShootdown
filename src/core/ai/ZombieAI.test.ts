import { describe, expect, it } from 'vitest';
import { FIELD_OF_VIEW_HALF_ANGLE, MAX_SEARCH_TIME, WANDER_SPEED, ZombieAI } from './ZombieAI';
import { AI } from '../components/AI';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { AISystem } from '../systems/AISystem';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { recordingContext } from '../../testing/fakeCanvas';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { TileMap } from '../../world/TileMap';

const centre = (tile : number) => (tile + 0.5) * TILE_SIZE;
const CHASE_SPEED = 20;
const SIGHT_DISTANCE = TILE_SIZE * 10;
const FACING_RIGHT = 0;
const FACING_LEFT = Math.PI;
const OPEN_ROOM = ['..............', '..............', '..............', '..............', '..............', '..............', '..............'];
const WALLED_ROOM = ['.......#......', '.......#......', '.......#......', '.......#......', '.......#......', '.......#......', '.......#......'];

function setUp(rows : string[], zombieTile : [number, number], playerTile : [number, number], facing = FACING_RIGHT) {
    const tileMap = new TileMap(chunksFromRows(rows));
    const player = new Entity('Player', new Point(centre(playerTile[0]), centre(playerTile[1]), 0), new Box(48, 48));
    const zombie = new Entity('Zombie', new Point(centre(zombieTile[0]), centre(zombieTile[1]), facing), new Box(48, 48));
    const movement = zombie.addComponent(new Movement(zombie.pos, CHASE_SPEED, 1));
    const ai = new ZombieAI(zombie, player, CHASE_SPEED, SIGHT_DISTANCE);
    zombie.addComponent(new AI(ai));
    zombie.build();
    return { tileMap, player, zombie, movement, ai };
}

describe('ZombieAI', () => {
    it('chases at its own chase speed when the player is in its field of view', () => {
        const { tileMap, zombie, movement, ai } = setUp(['......'], [0, 0], [5, 0]);
        ai.think(tileMap);
        ai.update(1);
        expect(ai.canSeePlayer).toBe(true);
        expect(movement.speed).toBe(CHASE_SPEED);
        expect(movement.direction.x).toBeGreaterThan(0);
        expect(zombie.pos.direction).toBeCloseTo(0);
    });

    it('sees the player anywhere inside its view cone, not just straight ahead', () => {
        const { tileMap, ai } = setUp(OPEN_ROOM, [1, 3], [5, 0]);
        ai.think(tileMap);
        expect(ai.canSeePlayer).toBe(true);
    });

    it('does not notice a player standing behind it', () => {
        const { tileMap, movement, ai } = setUp(OPEN_ROOM, [6, 3], [2, 3], FACING_RIGHT);
        ai.think(tileMap);
        ai.update(1);
        expect(ai.canSeePlayer).toBe(false);
        expect(movement.speed).toBe(WANDER_SPEED);
    });

    it('does not notice a player off to its side, outside its field of view', () => {
        const { tileMap, ai } = setUp(OPEN_ROOM, [3, 6], [4, 0], FACING_RIGHT);
        const sideAngle = Math.atan2(centre(0) - centre(6), centre(4) - centre(3));
        expect(Math.abs(sideAngle)).toBeGreaterThan(FIELD_OF_VIEW_HALF_ANGLE);
        ai.think(tileMap);
        expect(ai.canSeePlayer).toBe(false);
    });

    it('sees exactly as far as its sight distance and no further', () => {
        const row = ['.'.repeat(14)];
        const inReach = setUp(row, [0, 0], [10, 0]);
        inReach.ai.think(inReach.tileMap);
        expect(inReach.ai.canSeePlayer).toBe(true);

        const outOfReach = setUp(row, [0, 0], [11, 0]);
        outOfReach.ai.think(outOfReach.tileMap);
        expect(outOfReach.ai.canSeePlayer).toBe(false);
    });

    it('cannot see the player through walls and wanders slowly instead', () => {
        const { tileMap, movement, ai } = setUp(WALLED_ROOM, [3, 3], [12, 3]);
        ai.think(tileMap);
        ai.update(1);
        expect(ai.canSeePlayer).toBe(false);
        expect(movement.speed).toBe(WANDER_SPEED);
    });

    it('heads at chase speed for where it last saw the player once they slip out of view', () => {
        const { tileMap, player, zombie, movement, ai } = setUp(WALLED_ROOM, [1, 3], [5, 3]);
        ai.think(tileMap);
        const lastSeenX = player.pos.x, lastSeenY = player.pos.y;

        player.pos.set(centre(12), centre(0));
        ai.think(tileMap);
        ai.update(1);

        expect(ai.canSeePlayer).toBe(false);
        expect(ai.isSearching).toBe(true);
        expect(ai.lastSeen.x).toBe(lastSeenX);
        expect(ai.lastSeen.y).toBe(lastSeenY);
        expect(movement.speed).toBe(CHASE_SPEED);
        expect(movement.direction.x).toBeGreaterThan(0);
        expect(movement.direction.y).toBeCloseTo(0);
        expect(zombie.pos.direction).toBeCloseTo(0);
    });

    it('goes back to wandering once it reaches the last seen position and the player is gone', () => {
        const { tileMap, player, zombie, movement, ai } = setUp(WALLED_ROOM, [1, 3], [5, 3]);
        ai.think(tileMap);
        player.pos.set(centre(12), centre(0));
        zombie.pos.set(centre(5), centre(3));

        ai.think(tileMap);
        ai.update(1);

        expect(ai.isSearching).toBe(false);
        expect(movement.speed).toBe(WANDER_SPEED);
    });

    it('gives up on a last seen position it cannot reach in time', () => {
        const { tileMap, player, movement, ai } = setUp(WALLED_ROOM, [1, 3], [5, 3]);
        ai.think(tileMap);
        player.pos.set(centre(12), centre(0));

        ai.update(MAX_SEARCH_TIME);
        ai.think(tileMap);
        expect(ai.isSearching).toBe(true);

        ai.update(1);
        ai.think(tileMap);
        ai.update(1);
        expect(ai.isSearching).toBe(false);
        expect(movement.speed).toBe(WANDER_SPEED);
    });

    it('keeps facing the player while chasing, so a moving player stays in view', () => {
        const { tileMap, player, zombie, ai } = setUp(OPEN_ROOM, [1, 3], [6, 3]);
        ai.think(tileMap);
        player.pos.set(centre(6), centre(5));
        ai.update(1);
        expect(zombie.pos.direction).toBeCloseTo(Math.atan2(centre(5) - centre(3), centre(6) - centre(1)));

        player.pos.set(centre(6), centre(6));
        ai.think(tileMap);
        expect(ai.canSeePlayer).toBe(true);
    });

    it('forgets what it saw and faces a random way when reused from a pool', () => {
        const { tileMap, zombie, movement, ai } = setUp(['......'], [0, 0], [5, 0], FACING_LEFT);
        ai.think(tileMap);
        ai.reset();
        ai.update(1);
        expect(ai.canSeePlayer).toBe(false);
        expect(ai.isSearching).toBe(false);
        expect(movement.speed).toBe(WANDER_SPEED);
        expect(zombie.pos.direction).toBeGreaterThanOrEqual(0);
        expect(zombie.pos.direction).toBeLessThan(Math.PI * 2);
    });

    it('draws its view cone in the debug view, plus a line to where it last saw the player', () => {
        const { tileMap, player, ai } = setUp(WALLED_ROOM, [1, 3], [5, 3]);
        const wandering = recordingContext();
        ai.drawDebug(wandering.context);
        expect(wandering.count('arc')).toBe(1);
        expect(wandering.count('lineTo')).toBe(0);

        ai.think(tileMap);
        player.pos.set(centre(12), centre(0));
        ai.think(tileMap);
        const searching = recordingContext();
        ai.drawDebug(searching.context);
        expect(searching.count('arc')).toBe(1);
        expect(searching.count('lineTo')).toBeGreaterThan(0);
    });
});

describe('AISystem', () => {
    it('lets a limited number of active zombies think each frame, in turn', () => {
        const tileMap = new TileMap(chunksFromRows(['......']));
        const thoughts : number[] = [];
        const system = new AISystem(tileMap);
        for (let i = 0; i < 10; i++) {
            const zombie = new Entity('Zombie', new Point(0, 0, 0), new Box(1, 1));
            zombie.addComponent(new AI({ think: () => thoughts.push(i), update() {}, reset() {}, drawDebug() {} }));
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
