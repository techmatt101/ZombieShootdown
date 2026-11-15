import type { Game } from '../Game';
import type { IUI } from './IUI';
import type { Entity } from '../../core/Entity';
import { InputAction } from '../../lib/controllers/InputAction';
import { byId } from '../../lib/dom';
import { boxesOverlap } from '../../lib/geometry/overlap';

const ZOOM_SPEED = 0.1;

export class GameInterface implements IUI {
    #game : Game;
    #paused = false;
    #lastHealth = 0;
    #overlayElement : HTMLElement;
    #selectedEntity : Entity | null = null;


    constructor(game : Game) {
        this.#game = game;
        this.#overlayElement = byId('overlay');
        this.#overlayElement.hidden = true;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.code === 'Escape') {
                if (this.#paused) {
                    this.hide();
                    this.#game.sound.resumeAll();
                    this.#game.loop.start();
                    this.#paused = false;
                } else {
                    this.pause();
                    this.#game.loop.pause();
                    this.#game.sound.pauseAll();
                    this.#paused = true;
                }
            }
        }, { signal: game.signal });

        this.#game.canvas.element.addEventListener('mousedown', (e : MouseEvent) => {
            const pointer = this.#game.pointer;
            if (e.ctrlKey && pointer !== undefined) {
                const entities = this.#game.level.getEntities();
                this.#selectedEntity = null;
                for (let i = entities.length - 1; i >= 0; i--) {
                    if (boxesOverlap(entities[i].geometry, pointer.geometry)) {
                        this.#selectedEntity = entities[i];
                        break;
                    }
                }
                if (this.#selectedEntity !== null) {
                    console.log(this.#selectedEntity);
                }
            }
        }, { signal: game.signal });
    }

    pause() {
        this.#overlayElement.hidden = false;
        this.#overlayElement.innerHTML = 'Paused';
    }

    hide() {
        this.#overlayElement.hidden = true;
    }

    update(dt : number) {
        if (this.#game.inputState.isKeyDown(InputAction.ZOOM_IN)) {
            this.#game.camera.zoomBy(ZOOM_SPEED * dt);
        }

        if (this.#game.inputState.isKeyDown(InputAction.ZOOM_OUT)) {
            this.#game.camera.zoomBy(-ZOOM_SPEED * dt);
        }
    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.font = '20pt visitor';
        ctx.fillStyle = '#fff';

        const lineHeight = 25, margin = 20;
        let line = 1;

        const health = this.#game.player.getComponent('health').value;
        if (this.#lastHealth !== health) {
            ctx.fillStyle = '#f00';
            this.#lastHealth = health;
        }
        ctx.fillText(`Health: ${health}`, margin, this.#game.canvas.height - lineHeight * line++);

        ctx.fillStyle = '#fff';

        ctx.fillText(`Score: ${this.#game.logic.score}`, margin, this.#game.canvas.height - lineHeight * line++);
        if (this.#game.logic.wave !== undefined) {
            ctx.fillText(`Wave: ${this.#game.logic.wave}`, margin, this.#game.canvas.height - lineHeight * line++);
        }

        const nearbyDoor = this.#game.player.getComponent('interactor').target?.components.door;
        if (nearbyDoor !== undefined) {
            const doorAction = nearbyDoor.isOpen ? 'close' : 'open';
            ctx.textAlign = 'center';
            ctx.fillText(`E: ${doorAction} door`, this.#game.canvas.width / 2, this.#game.canvas.height - lineHeight);
            ctx.textAlign = 'start';
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        const selected = this.#selectedEntity;
        if (selected !== null) {
            ctx.fillStyle = '#fff';
            ctx.font = '10pt visitor';
            ctx.fillText(`ID: ${selected.id} Type: ${selected.type} Instance: ${selected.constructor.name}`, 5, 10);
            let space = 5;
            const spaceGap = 5;
            let line = 20;
            const lineGap = 10;
            loop(selected);
            function loop(obj : object) {
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value : unknown = (obj as Record<string, unknown>)[key];
                    if (key[0] !== '_' && typeof value !== 'function' && !(value instanceof Image)) {
                        if (typeof value === 'object' && value !== null) {
                            ctx.fillText(`${key}:`, space, line);
                            line += lineGap;
                            space += spaceGap;
                            loop(value);
                            space -= spaceGap;
                        } else {
                            ctx.fillText(`${key}: ${value}`, space, line);
                            line += lineGap;
                        }
                    }
                }
            }
        }
    }
}
