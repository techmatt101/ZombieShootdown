class SoundController {
    private _audioClips : {[index : string] : HTMLAudioElement} = {};


    load (name : Sound, audio : HTMLAudioElement) {
        this._audioClips[name] = audio;
    }

    play (key : Sound) {
        this._audioClips[key].play();
    }

    pauseAll () {
        for(var key in this._audioClips) {
            this._audioClips[key].pause();
        }
    }
}

enum Sound {
    AMBIENT
}