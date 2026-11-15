export interface GameConfig {
    debug : boolean;
    sound : boolean;
    lighting : boolean;
    skipMenu : boolean;
    keyMappings : Record<number, string>;
    // Referenced by Game.ts but not currently defined, so controllers receive no mappings.
    gamepadKeyMappings? : Record<number, string>;
    mouseKeyMappings? : Record<number, string>;
}

export const Config : GameConfig = {
    debug: true,
    sound: false,
    lighting: false,
    skipMenu: false,

    keyMappings: {
        87: 'UP', //W Key
        68: 'RIGHT', //D Key
        65: 'LEFT', //A Key
        83: 'DOWN', //S Key
        38: 'UP', //UP Key
        40: 'DOWN', //DOWN Key
        37: 'LEFT', //LEFT Key
        39: 'RIGHT', //RIGHT Key
        32: 'ACTION_1', //Space Key
        0: 'ACTION_1', //Left Click
        2: 'ACTION_2', //Right Click
        27: 'MENU' //Escape
    }
};