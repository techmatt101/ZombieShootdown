class ResourceManager {
    private static _pending_resource = 0;
    private static _path = 'assets/';
    private static _cache = {};
    private static _callback : () => void = null;


    private static _startRequest (name) {
        console.info("Loading " + name);
        ResourceManager._pending_resource++;
    }

    private static _endRequest () {
        ResourceManager._pending_resource--;
        if(ResourceManager._callback !== null && ResourceManager._pending_resource <= 0) {
            ResourceManager._runCallback();
        }
    }

    private static _runCallback() {
        setTimeout(() => {
            if(ResourceManager._pending_resource <= 0) {
                ResourceManager._callback();
                ResourceManager._callback = null;
            }
        }, 0);
    }

    static waitForPendingResources(callback) {
        ResourceManager._callback = callback;
        ResourceManager._runCallback()
    }

    static retrieveJson(name, callback : (jsonResponse : Object) => void) {
        ResourceManager.request('data/' + name + '.json', (response) => {
            callback(JSON.parse(response));
        });
        console.log("Loaded: " + name);
    }

    static retrieveImage(name, callback : (image : HTMLImageElement) => void) {
        var cache = ResourceManager._cache[name + '_img'];
        if(typeof cache !== 'undefined') {
            callback(cache);
            return;
        }

        var img = new Image();
        img.onload = () => {
            ResourceManager._endRequest();
            callback(img);
        };
        img.src = ResourceManager._path + 'img/' + name + '.png';
        ResourceManager._cache[name + '_img'] = img;
        ResourceManager._startRequest(name + ' Image');

        //ResourceManager.request(name, (response) => {
        //    var img = new Image(); // http://stackoverflow.com/questions/9292133/receiving-image-through-websocket
        //    img.id = name;
        //    img.src = 'data:image/png;base64,' + response;
        //    callback(img);
        //});
    }

    static retrieveSound(name, callback : (audio : HTMLAudioElement) => void) {
        ResourceManager.request(name, (response) => {
            var audio = new Audio();
            audio.id = name;
            audio.src = 'data:audio/wav;base64,' + response;
            callback(audio);
        });
        console.log("Loaded: " + name);
    }

    static request(file, callback : (response : string) => void) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    callback(request.responseText);
                } else {
                    console.warn('Failed to Load File: ' + file);//TODO: error handling
                }
            }
        };
        request.open('GET', 'http://127.0.0.1:8000/server/' + file, true);//todo: create default locations for file types
        request.send();
    }
}