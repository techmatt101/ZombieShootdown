import type { Entity } from '../../core/Entity';
import type { IObserver } from '../../lib/EventHandler';

export enum GameLogicEvent {
    OVER,
}

export interface IGameLogic extends IObserver<GameLogicEvent> {
    score : number;
    wave? : number;

    start(player : Entity) : void;
}
