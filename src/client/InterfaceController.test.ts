import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InterfaceController } from './InterfaceController';

interface FakeElement {
    hidden : boolean;
    textContent : string;
    addEventListener() : void;
    getBoundingClientRect() : { width : number; height : number };
    requestFullscreen() : Promise<void>;
}

let elements : Map<string, FakeElement>;

function element(id : string) {
    const existing = elements.get(id);
    if (existing !== undefined) return existing;
    const created : FakeElement = {
        hidden: false,
        textContent: '',
        addEventListener() {},
        getBoundingClientRect: () => ({ width: 0, height: 0 }),
        requestFullscreen: async () => {},
    };
    elements.set(id, created);
    return created;
}

beforeEach(() => {
    elements = new Map();
    vi.stubGlobal('document', { getElementById: element, addEventListener() {} });
    vi.stubGlobal('window', { addEventListener() {} });
    vi.stubGlobal('location', { search: '' });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function controller() {
    return new InterfaceController({
        startArcade: vi.fn(),
        startDevLevel: vi.fn(),
        startBunnyTest: vi.fn(),
        restart: vi.fn(),
        mainMenu: vi.fn(),
    });
}

describe('InterfaceController', () => {
    it('shows the game over screen on its own, without the main menu behind it', () => {
        const ui = controller();
        element('interface').hidden = true;
        element('game-over').hidden = true;
        ui.gameOver({ score: 10 });
        expect(element('interface').hidden).toBe(false);
        expect(element('game-over').hidden).toBe(false);
        expect(element('welcome').hidden).toBe(true);
    });

    it('swaps the game over screen for the main menu', () => {
        const ui = controller();
        ui.gameOver({ score: 10 });
        ui.showMenu();
        expect(element('game-over').hidden).toBe(true);
        expect(element('welcome').hidden).toBe(false);
        expect(element('interface').hidden).toBe(false);
    });
});
