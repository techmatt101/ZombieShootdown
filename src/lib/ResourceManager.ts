export class ResourceManager {
    static #pendingResource = 0;
    static #assetPath = 'assets/';
    static #cache : Record<string, HTMLImageElement | HTMLAudioElement> = {};
    static #callback : (() => void) | null = null;


    static #startRequest(name : string) {
        console.info("Loading " + name);
        ResourceManager.#pendingResource++;
    }

    static #endRequest() {
        ResourceManager.#pendingResource--;
        if (ResourceManager.#callback !== null && ResourceManager.#pendingResource <= 0) {
            ResourceManager.#runCallback();
        }
    }

    static #runCallback() {
        setTimeout(() => {
            if (ResourceManager.#pendingResource <= 0 && ResourceManager.#callback !== null) {
                ResourceManager.#callback();
                ResourceManager.#callback = null;
            }
        }, 0);
    }

    static waitForPendingResources(callback : () => void) {
        ResourceManager.#callback = callback;
        ResourceManager.#runCallback()
    }

    static retrieveImage(name : string, callback : (image : HTMLImageElement) => void) {
        var cache = ResourceManager.#cache[name + '_img'];
        if (cache instanceof HTMLImageElement) {
            callback(cache);
            return;
        }

        var img = new Image();
        img.addEventListener('load', () => {
            ResourceManager.#endRequest();
            callback(img);
        });
        img.src = ResourceManager.#assetPath + 'img/' + name + '.png';
        ResourceManager.#cache[name + '_img'] = img;
        ResourceManager.#startRequest(name + ' Image');
    }

    static retrieveSound(name : string, callback : (audio : HTMLAudioElement) => void) {
        var cache = ResourceManager.#cache[name + '_audio'];
        if (cache instanceof HTMLAudioElement) {
            callback(cache);
            return;
        }

        var sound = new Audio(ResourceManager.#assetPath + 'audio/' + name + '.mp3');
        sound.addEventListener('canplaythrough', () => {
            ResourceManager.#endRequest();
            callback(sound);
        });

        ResourceManager.#cache[name + '_audio'] = sound;
        ResourceManager.#startRequest(name + ' Audio');
    }

    //static retrieveJson(name, callback : (jsonResponse : Object) => void) {
    //    ResourceManager.request('data/' + name + '.json', (response) => {
    //        callback(JSON.parse(response));
    //    });
    //    console.log("Loaded: " + name);
    //}

    //static request(file, callback : (response : string) => void) {
    //    var request = new XMLHttpRequest();
    //
    //    request.onreadystatechange = function () {
    //        if (request.readyState === 4) {
    //            if (request.status === 200) {
    //                callback(request.responseText);
    //            } else {
    //                console.warn('Failed to Load File: ' + file);//TODO: error handling
    //            }
    //        }
    //    };
    //    request.open('GET', 'http://127.0.0.1:8000/server/' + file, true);//todo: create default locations for file types
    //    request.send();
    //}
}
