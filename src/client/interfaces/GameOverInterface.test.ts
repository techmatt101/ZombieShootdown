import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameOverInterface } from './GameOverInterface';

interface FakeElement {
    hidden : boolean;
    textContent : string;
    listeners : Map<string, () => void>;
    addEventListener(type : string, listener : () => void) : void;
}

function element(hidden = false) : FakeElement {
    return {
        hidden,
        textContent: '',
        listeners: new Map(),
        addEventListener(type, listener) {
            this.listeners.set(type, listener);
        },
    };
}

let elements : Record<string, FakeElement>;
let windowKeydown : (event : { code : string }) => void;

beforeEach(() => {
    elements = {
        'interface': element(true),
        'game-over': element(true),
        'game-over-score': element(),
        'game-over-wave': element(),
        'restart': element(),
        'main-menu': element(),
    };
    vi.stubGlobal('document', { getElementById: (id : string) => elements[id] ?? null });
    vi.stubGlobal('window', { addEventListener: (type : string, listener : (event : { code : string }) => void) => {
        windowKeydown = listener;
    } });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function setUp() {
    const actions = { restart: vi.fn(), mainMenu: vi.fn() };
    const screen = new GameOverInterface(actions);
    return { screen, actions };
}

describe('GameOverInterface', () => {
    it('shows the final score and wave over the game', () => {
        const { screen } = setUp();
        screen.show({ score: 470, wave: 4 });
        expect(screen.isShowing).toBe(true);
        expect(elements['game-over-score'].textContent).toBe('Score: 470');
        expect(elements['game-over-wave'].textContent).toBe('Wave: 4');
        expect(elements['game-over-wave'].hidden).toBe(false);
    });

    it('leaves the wave out for modes without waves', () => {
        const { screen } = setUp();
        screen.show({ score: 30 });
        expect(elements['game-over-wave'].hidden).toBe(true);
    });

    it('restarts from the button or the Enter key, hiding the menus', () => {
        const { screen, actions } = setUp();
        screen.show({ score: 0 });
        elements['restart'].listeners.get('click')!();
        expect(actions.restart).toHaveBeenCalledOnce();
        expect(elements['interface'].hidden).toBe(true);
        expect(screen.isShowing).toBe(false);

        screen.show({ score: 0 });
        windowKeydown({ code: 'Enter' });
        expect(actions.restart).toHaveBeenCalledTimes(2);
    });

    it('ignores Enter while it is not showing', () => {
        const { actions } = setUp();
        windowKeydown({ code: 'Enter' });
        expect(actions.restart).not.toHaveBeenCalled();
    });

    it('goes back to the main menu', () => {
        const { screen, actions } = setUp();
        screen.show({ score: 0 });
        elements['main-menu'].listeners.get('click')!();
        expect(actions.mainMenu).toHaveBeenCalledOnce();
        expect(elements['game-over'].hidden).toBe(true);
    });
});
