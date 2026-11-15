export enum Sound {
    AMBIENT
}

export class SoundController {
    #audioClips : {[index : string] : HTMLAudioElement} = {};


    load(name : Sound, audio : HTMLAudioElement) {
        this.#audioClips[name] = audio;
    }

    play(key : Sound) {
        //if (Config.sound) {
        //    this._audioClips[key].play();
        //}
    }

    pauseAll() {
        for (var key in this.#audioClips) {
            this.#audioClips[key].pause();
        }
    }
}
