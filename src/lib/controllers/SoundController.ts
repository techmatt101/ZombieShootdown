export enum Sound {
    AMBIENT
}

export class SoundController {
    #enabled : boolean;
    #audioClips = new Map<Sound, HTMLAudioElement>();
    #pausedClips : HTMLAudioElement[] = [];

    constructor(enabled : boolean) {
        this.#enabled = enabled;
    }

    load(name : Sound, audio : HTMLAudioElement) {
        this.#audioClips.set(name, audio);
    }

    play(key : Sound) {
        const clip = this.#audioClips.get(key);
        if (this.#enabled && clip !== undefined) {
            this.#start(clip);
        }
    }

    pauseAll() {
        this.#pausedClips = [];
        for (const clip of this.#audioClips.values()) {
            if (!clip.paused) {
                clip.pause();
                this.#pausedClips.push(clip);
            }
        }
    }

    resumeAll() {
        const pausedClips = this.#pausedClips;
        for (let i = 0; i < pausedClips.length; i++) {
            this.#start(pausedClips[i]);
        }
        this.#pausedClips = [];
    }

    #start(clip : HTMLAudioElement) {
        clip.play().catch((error : unknown) => console.warn('Audio playback was blocked', error));
    }
}
