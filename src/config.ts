import type { KeyMappings } from './lib/controllers/KeyMapper';

export interface GameConfig {
    debug : boolean;
    sound : boolean;
    lighting : boolean;
    skipMenu : boolean;
    /** Keyboard `KeyboardEvent.code` values and mouse buttons (`Mouse<button>`). */
    keyMappings : KeyMappings;
    /** Standard-layout gamepad buttons (`Button<index>`). */
    gamepadKeyMappings : KeyMappings;
}

export const Config : GameConfig = {
    debug: true,
    sound: false,
    lighting: false,
    skipMenu: false,

    keyMappings: {
        KeyW: 'UP',
        KeyD: 'RIGHT',
        KeyA: 'LEFT',
        KeyS: 'DOWN',
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        Space: 'ACTION_1',
        Mouse0: 'ACTION_1', // Left click
        Mouse2: 'ACTION_2', // Right click
        Escape: 'MENU',
    },

    gamepadKeyMappings: {},
};
