import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AmbientZombieLogic } from './AmbientZombieLogic';
import type { IGameLogic } from './IGameLogic';
import { spawnPlayer } from '../../core/factories/PlayerFactory';
import { InputState } from '../../lib/controllers/InputState';
import { levelOn } from '../../testing/levelFixtures';
import { FakeChunkSource } from '../../testing/worldFixtures';
import { generateChunk } from '../../world/generateChunk';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

const SEED = 8;

function chunkWithZombies(cx : number) {
    const chunk = generateChunk(SEED, cx, 1);
    expect(chunk.zombieSpawns.length).toBeGreaterThan(0);
    return chunk;
}

function setUp() {
    const chunks = new FakeChunkSource();
    const fixture = levelOn(chunks);
    const logic = new AmbientZombieLogic(fixture.level);
    const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
    const zombies = () => fixture.level.getEntities().filter((entity) => entity.type === 'Zombie' && entity.active);
    return { ...fixture, logic, player, zombies };
}

describe('AmbientZombieLogic', () => {
    it('waits for the player, then fills every loaded chunk with its zombies', () => {
        const { chunks, logic, player, zombies } = setUp();
        const chunk = chunks.load(chunkWithZombies(2));
        expect(zombies().length).toBe(0);
        logic.start(player);
        expect(zombies().length).toBe(chunk.zombieSpawns.length / 2);
        const gameLogic : IGameLogic = logic;
        expect(gameLogic.wave).toBeUndefined();
    });

    it('adds zombies as chunks load and removes them as chunks unload', () => {
        const { chunks, logic, player, zombies } = setUp();
        logic.start(player);
        const chunk = chunks.load(chunkWithZombies(2));
        const count = chunk.zombieSpawns.length / 2;
        expect(zombies().length).toBe(count);
        chunks.unload(2, 1);
        expect(zombies().length).toBe(0);
        chunks.load(chunkWithZombies(2));
        expect(zombies().length).toBe(count);
    });

    it('keeps killed zombies dead when their chunk comes back, and scores the kill', () => {
        const { chunks, logic, player, zombies, level } = setUp();
        logic.start(player);
        const chunk = chunks.load(chunkWithZombies(2));
        const count = chunk.zombieSpawns.length / 2;
        zombies()[0].getComponent('health').take(1000);
        expect(logic.score).toBe(10);
        expect(zombies().length).toBe(count - 1);
        expect(level.getEntities().filter((entity) => entity.type === 'Dead Zombie').length).toBe(1);

        chunks.unload(2, 1);
        chunks.load(chunkWithZombies(2));
        expect(zombies().length).toBe(count - 1);
    });

    it('releases zombies by where they are now, not where they spawned', () => {
        const { chunks, logic, player, zombies } = setUp();
        logic.start(player);
        chunks.load(chunkWithZombies(2));
        const wanderer = zombies()[0];
        wanderer.pos.set(-5000, -5000);
        chunks.unload(2, 1);
        expect(wanderer.active).toBe(true);
    });
});
