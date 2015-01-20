

class FlickrPhotoRequester implements IRequester {

    private _keyword = 'cartoon';

    setKeyWord(word) {
        this._keyword = word;
    }

    request (callback) {
        var options = {
            api_key: '8caacff452ab56279e9c871c36ceb4f9',
            format: 'json',
            method: 'flickr.photos.search',
            per_page: 10,
            tags: ['zombie', this._keyword],
            tag_mode: 'all'
        };

        JSONP.get('https://api.flickr.com/services/rest/', options, callback, 'jsoncallback');
    }
}