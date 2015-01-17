module ZombieApp {
    export class ResourceManager {
        private static _pendingResource = 0;
        private static _assetPath = 'assets/';
        private static _cache = {};
        private static _callback : () => void = null;


        private static _startRequest(name) {
            console.info("Loading " + name);
            ResourceManager._pendingResource++;
        }

        private static _endRequest() {
            ResourceManager._pendingResource--;
            if (ResourceManager._callback !== null && ResourceManager._pendingResource <= 0) {
                ResourceManager._runCallback();
            }
        }

        private static _runCallback() {
            setTimeout(() => {
                if (ResourceManager._pendingResource <= 0) {
                    ResourceManager._callback();
                    ResourceManager._callback = null;
                }
            }, 0);
        }

        static waitForPendingResources(callback) {
            ResourceManager._callback = callback;
            ResourceManager._runCallback()
        }

        static retrieveImage(name, callback : (image : HTMLImageElement) => void) {
            var cache = ResourceManager._cache[name + '_img'];
            if (typeof cache !== 'undefined') {
                callback(cache);
                return;
            }

            var img = new Image();
            img.addEventListener('load', () => {
                ResourceManager._endRequest();
                callback(img);
            });
            img.src = ResourceManager._assetPath + 'img/' + name + '.png';
            ResourceManager._cache[name + '_img'] = img;
            ResourceManager._startRequest(name + ' Image');
        }

        static retrieveSound(name, callback : (image : HTMLAudioElement) => void) {
            var cache = ResourceManager._cache[name + '_audio'];
            if (typeof cache !== 'undefined') {
                callback(cache);
                return;
            }

            var sound = new Audio(ResourceManager._assetPath + 'audio/' + name + '.mp3');
            sound.addEventListener('canplaythrough', () => {
                ResourceManager._endRequest();
                callback(sound);
            });

            ResourceManager._cache[name + '_audio'] = sound;
            ResourceManager._startRequest(name + ' Audio');
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
}