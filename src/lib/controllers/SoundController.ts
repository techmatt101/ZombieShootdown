module ZombieApp {
    export class SoundController {
        private _audioClips : {[index : string] : HTMLAudioElement} = {};


        load(name : Sound, audio : HTMLAudioElement) {
            this._audioClips[name] = audio;
        }

        play(key : Sound) {
            //if (Config.sound) {
            //    this._audioClips[key].play();
            //}
        }

        pauseAll() {
            for (var key in this._audioClips) {
                this._audioClips[key].pause();
            }
        }
    }

    export enum Sound {
        AMBIENT
    }
}