import { Game } from '../Game';
import type { IUI } from './IUI';
import { Entity } from '../../core/Entity';
import { InputAction } from '../../lib/controllers/InputAction';
import { byId } from '../../lib/dom';

export class GameInterface implements IUI {
    #game : Game;
    #paused = false;
    #lastHealth = 0;
    #overlayElement : HTMLElement;
    #selectedEntity : Entity | null = null;

    //private _fps = 0;
    //private _fpsBuffer = [];


    constructor(game : Game) {
        this.#game = game;
        this.#overlayElement = byId('overlay');
        this.#overlayElement.hidden = true;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (this.#paused) {
                    this.hide();
                    this.#game.loop.start();
                    this.#paused = false;
                } else {
                    this.pause();
                    this.#game.loop.pause();
                    this.#game.sound.pauseAll();
                    this.#paused = true;
                }
            }
        });

        this.#game.canvas.element.addEventListener('mousedown', (e : MouseEvent) => {
            if (e.ctrlKey) {
                var length = this.#game.level.getEntities().length;
                for (var i = length - 1; i >= 0; i--) {
                    var entity = this.#game.level.getEntities()[i];
                    if ((entity.geometry).isBoundingBoxWith(this.#game.pointer.geometry)) {
                        this.#selectedEntity = entity;
                        console.log(entity);
                        return;
                    }
                }
                this.#selectedEntity = null;
            }
        });
    }

    pause() {
        this.#overlayElement.hidden = false;
        this.#overlayElement.innerHTML = 'Paused';
    }

    hide() {
        this.#overlayElement.hidden = true;
    }

    update(dt : number) {
        if(this.#game.inputState.isKeyDown(InputAction.ZOOM_IN)) {
            this.#game.camera.zoom += 0.1 * dt;
        }

        if(this.#game.inputState.isKeyDown(InputAction.ZOOM_OUT)) {
            this.#game.camera.zoom -= 0.1 * dt;
        }

//            if(this.fpsBuffer.length > 15){
//                var sum = 0;
//                for(var i = 0; i < this.fpsBuffer.length; i++){
//                    sum += this.fpsBuffer[i];
//                }
//                this.fps = ~~(sum / this.fpsBuffer.length);
//                this.fpsBuffer = [];
//            }
//            this.fpsBuffer.push(60 / (time * 6));
    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.font = '20pt visitor';
        ctx.fillStyle = '#fff';

        var lineHeight = 25, line = 1, margin = 20;

        var health = this.#game.player.getComponent('health').value;
        if (this.#lastHealth !== health) {
            ctx.fillStyle = '#f00';
            this.#lastHealth = health;
        }
        ctx.fillText('Health: ' + health, margin, this.#game.canvas.height - lineHeight * line++);

        ctx.fillStyle = '#fff';

        ctx.fillText('Score: ' + this.#game.logic.score, margin, this.#game.canvas.height - lineHeight * line++);
        ctx.fillText('Wave: ' + this.#game.logic.wave, margin, this.#game.canvas.height - lineHeight * line++);
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        const selected = this.#selectedEntity;
        if (selected !== null) {
            ctx.fillStyle = '#fff';
            ctx.font = '10pt visitor';
            ctx.fillText('ID: ' + selected.id + ' Type: ' + selected.type + ' Instance: ' + selected.constructor.name, 5, 10);
            var space = 5;
            var spaceGap = 5;
            var line = 20;
            var lineGap = 10;
            loop(selected);
            function loop(obj : object) {
                for (const [key, value] of Object.entries(obj)) {
                    if (key[0] !== '_' && typeof value !== 'function' && !(value instanceof Image)) {
                        if (typeof value === 'object' && value !== null) {
                            ctx.fillText(key + ':', space, line);
                            line += lineGap;
                            space += spaceGap;
                            loop(value);
                            space -= spaceGap;
                        } else {
                            ctx.fillText(key + ': ' + value, space, line);
                            line += lineGap;
                        }
                    }
                }
            }
        }
//            ctx.fillStyle = "#fff";
//            ctx.fillText(this.fps + " fps", this.x+1, this.y+1);
//            ctx.fillStyle = "#f00";
//            ctx.fillText(this.fps + " fps", this.x, this.y);
    }

}
