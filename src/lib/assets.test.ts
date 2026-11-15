import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeImage {
    static created : FakeImage[] = [];
    src = '';
    #resolveDecode! : () => void;
    #decoded = new Promise<void>((resolve) => {
        this.#resolveDecode = resolve;
    });

    constructor() {
        FakeImage.created.push(this);
    }

    decode() {
        return this.#decoded;
    }

    finishLoading() {
        this.#resolveDecode();
    }
}

beforeEach(() => {
    vi.resetModules();
    FakeImage.created = [];
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('assets', () => {
    it('loads each image once from the asset folder', async () => {
        const { loadImage } = await import('./assets');
        const first = loadImage('player');
        const second = loadImage('player');
        expect(first).toBe(second);
        expect(FakeImage.created.length).toBe(1);
        expect(FakeImage.created[0].src).toBe('assets/img/player.png');
        FakeImage.created[0].finishLoading();
        expect(await first).toBe(FakeImage.created[0]);
    });

    it('waits for every pending asset, including ones requested while waiting', async () => {
        const { loadImage, whenAssetsLoaded } = await import('./assets');
        void loadImage('a');
        let settled = false;
        const waiting = whenAssetsLoaded().then(() => {
            settled = true;
        });
        void loadImage('b');
        FakeImage.created[0].finishLoading();
        await Promise.resolve();
        await Promise.resolve();
        expect(settled).toBe(false);
        FakeImage.created[1].finishLoading();
        await waiting;
        expect(settled).toBe(true);
    });

    it('resolves immediately when nothing is loading', async () => {
        const { whenAssetsLoaded } = await import('./assets');
        await expect(whenAssetsLoaded()).resolves.toBeUndefined();
    });
});
