class ResourceManager {
    private _pending_resource = 0;
    private static _path = 'assets/';
    private static _cache = {};


    static retrieveJson(name, callback : (jsonResponse : Object) => void) {
        this.request('data/' + name + '.json', (response) => {
            callback(JSON.parse(response));
        });
        console.log("Loaded: " + name);
    }

    static retrieveImage(name, callback : (image : HTMLImageElement) => void) {
        var cache = this._cache[name + '_img'];
        if(typeof cache !== 'undefined') {
            callback(cache);
            return;
        }

        var img = new Image();
        img.onload = () => {
            callback(img);
        };
        img.src = this._path + 'img/' + name + '.png';
        this._cache[name + '_img'] = img;

        console.info("Loaded Image: " + name);

        //this.request(name, (response) => {
        //    var img = new Image(); // http://stackoverflow.com/questions/9292133/receiving-image-through-websocket
        //    img.id = name;
        //    img.src = 'data:image/png;base64,' + response;
        //    callback(img);
        //});
    }

    static retrieveSound(name, callback : (audio : HTMLAudioElement) => void) {
        this.request(name, (response) => {
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