class SoundController {
    private _audioClips : {[index : string] : HTMLAudioElement} = {};


    load(name: string, audio : HTMLAudioElement) {
        this._audioClips[name] = audio;
    }

    play(key : string) {
        this._audioClips[key].play();
    }
}