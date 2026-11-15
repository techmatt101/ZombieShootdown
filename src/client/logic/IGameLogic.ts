import type { Entity } from '../../core/Entity';

export interface IGameLogic {
    score : number;
    wave? : number;

    start(player : Entity) : void;
}
