import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SinglePlayerWaveLogic } from './SinglePlayerWaveLogic';
import type { Entity } from '../../core/Entity';
import { spawnPlayer } from '../../core/factories/PlayerFactory';
import { InputState } from '../../lib/controllers/InputState';
import { Vector } from '../../lib/geometry/Vector';
import { levelOn } from '../../testing/levelFixtures';
import { generatedChunks } from '../../testing/worldFixtures';
import { CHUNK_SIZE, TILE_SIZE } from '../../world/constants';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

function setUp() {
    const fixture = levelOn(generatedChunks(21, 3));
    const player = spawnPlayer(fixture.tileMap.spawnPoint(), new InputState());
    fixture.camera.setTarget(player.pos);
    fixture.camera.jumpToTarget();
    const logic = new SinglePlayerWaveLogic(fixture.level);
    logic.start(player);
    const zombies = () => fixture.level.getEntities().filter((entity) => entity.type === 'Zombie' && entity.active);
    return { ...fixture, player, logic, zombies };
}

function killAll(zombies : Entity[]) {
    for (let i = 0; i < zombies.length; i++) {
        zombies[i].getComponent('health').take(1000);
    }
}

describe('SinglePlayerWaveLogic', () => {
    it('starts wave one with zombies off screen, on open floor', () => {
        const { logic, zombies, camera, tileMap } = setUp();
        expect(logic.wave).toBe(1);
        const spawned = zombies();
        expect(spawned.length).toBe(4);
        for (let i = 0; i < spawned.length; i++) {
            expect(camera.isInCurrentView(spawned[i].pos, 0)).toBe(false);
            expect(tileMap.isSolidTile(Math.floor(spawned[i].pos.x / TILE_SIZE), Math.floor(spawned[i].pos.y / TILE_SIZE))).toBe(false);
        }
    });

    it('scores kills and starts a bigger wave once every zombie is dead', () => {
        const { logic, zombies, level } = setUp();
        killAll(zombies());
        expect(logic.score).toBe(4 * 10 + 100);
        expect(logic.wave).toBe(2);
        expect(zombies().length).toBe(6);
        expect(level.getEntities().filter((entity) => entity.type === 'Dead Zombie').length).toBe(4);
    });

    it('revives recycled zombies at full health', () => {
        const { zombies } = setUp();
        killAll(zombies());
        const next = zombies();
        for (let i = 0; i < next.length; i++) {
            expect(next[i].getComponent('health')).toMatchObject({ value: 100, isDead: false });
        }
    });

    it('moves zombies out of a chunk that unloads, back near the player', () => {
        const { zombies, chunks, player } = setUp();
        const stranded = zombies()[0];
        stranded.pos.set(CHUNK_SIZE * 3 + 10, 10);
        chunks.unload(3, 0);
        expect(Math.floor(stranded.pos.x / CHUNK_SIZE)).not.toBe(3);
        expect(Math.hypot(stranded.pos.x - player.pos.x, stranded.pos.y - player.pos.y)).toBeLessThanOrEqual(1400);
        expect(stranded.pos).not.toEqual(new Vector(CHUNK_SIZE * 3 + 10, 10));
    });
});
