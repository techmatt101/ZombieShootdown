export enum Sound {
    AMBIENT
}

export class SoundController {
    #audioClips = new Map<Sound, HTMLAudioElement>();


    load(name : Sound, audio : HTMLAudioElement) {
        this.#audioClips.set(name, audio);
    }

    play(key : Sound) {
        //if (Config.sound) {
        //    this._audioClips[key].play();
        //}
    }

    pauseAll() {
        for (const clip of this.#audioClips.values()) {
            clip.pause();
        }
    }
}
