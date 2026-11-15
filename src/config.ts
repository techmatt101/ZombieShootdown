import type { KeyMappings } from './lib/controllers/KeyMapper';

export interface GameConfig {
    debug : boolean;
    sound : boolean;
    lighting : boolean;
    skipMenu : boolean;
    keyMappings : KeyMappings;
    gamepadKeyMappings : KeyMappings;
}

export const Config : GameConfig = {
    debug: false,
    sound: false,
    lighting: true,
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
        Mouse0: 'ACTION_1',
        KeyE: 'INTERACT',
        Mouse2: 'INTERACT',
        Escape: 'MENU',
        Equal: 'ZOOM_IN',
        Minus: 'ZOOM_OUT',
    },

    gamepadKeyMappings: {
        Button0: 'INTERACT',
        Button7: 'ACTION_1',
    },
};
