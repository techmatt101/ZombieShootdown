import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeadBodies } from './DeadBodies';
import { DYING } from '../../core/factories/EnemyFactory';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';
import { levelOn } from '../../testing/levelFixtures';
import { FakeChunkSource } from '../../testing/worldFixtures';

const sheetLoad = vi.hoisted(() => ({ resolve: (_sheet : object) => {}, promise: Promise.resolve({}) as Promise<object> }));

vi.mock('../../lib/assets', () => ({ loadImage: () => sheetLoad.promise }));

const DEATH_SHEET = { width: 144, height: 33 };
const FALLING_BODY = DYING.spriteSequence[0];
const SPREAD_POOL = DYING.spriteSequence.at(-1)!;

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
    sheetLoad.promise = new Promise((resolve) => {
        sheetLoad.resolve = resolve;
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

async function loadedBodies() {
    const { level } = levelOn(new FakeChunkSource());
    const bodies = new DeadBodies(level);
    sheetLoad.resolve(DEATH_SHEET);
    await sheetLoad.promise;
    return { level, bodies };
}

function bodiesIn(level : ReturnType<typeof levelOn>['level']) {
    return level.getEntities().filter((entity) => entity.type === 'Dead Zombie');
}

describe('DeadBodies', () => {
    it('places bodies where zombies fell and recycles the oldest beyond its cap', async () => {
        const { level, bodies } = await loadedBodies();
        for (let i = 0; i < 70; i++) {
            bodies.place({ x: i, y: 0, direction: 0 });
        }
        const placed = bodiesIn(level);
        expect(placed.length).toBe(64);
        expect(placed[0].pos.x).toBe(64);
        expect(placed[5].pos.x).toBe(69);
        expect(placed[6].pos.x).toBe(6);
    });

    it('draws a new body textured from the very first frame, never as an untextured box', async () => {
        const { level, bodies } = await loadedBodies();
        bodies.place({ x: 0, y: 0, direction: 0 });
        const texture = bodiesIn(level)[0].getComponent('material').texture;
        expect(texture?.img).toBe(DEATH_SHEET);
        expect(texture?.sourcePos.x).toBe(FALLING_BODY.x);
    });

    it('places no bodies before the death sheet has loaded', () => {
        const { level } = levelOn(new FakeChunkSource());
        new DeadBodies(level).place({ x: 0, y: 0, direction: 0 });
        expect(bodiesIn(level).length).toBe(0);
    });

    it('lays each body facing the way its zombie was heading', async () => {
        const { level, bodies } = await loadedBodies();
        bodies.place({ x: 10, y: 20, direction: 1.2 });
        expect(bodiesIn(level)[0].pos).toMatchObject({ x: 10, y: 20, direction: 1.2 });
    });

    it('plays the death from the falling body every time a body is placed, even a recycled one', async () => {
        const { level, bodies } = await loadedBodies();
        bodies.place({ x: 0, y: 0, direction: 0 });
        const body = bodiesIn(level)[0];
        const texture = body.getComponent('material').texture!;

        body.update(0.1);
        expect(texture.sourcePos.x).toBe(FALLING_BODY.x);
        body.update(DYING.animationTime);
        expect(texture.sourcePos.x).toBe(SPREAD_POOL.x);

        for (let i = 0; i < 64; i++) {
            bodies.place({ x: i, y: 0, direction: 0 });
        }
        body.update(0.1);
        expect(texture.sourcePos.x).toBe(FALLING_BODY.x);
    });
});
