class SpriteAnimation {
    private _step = 0;
    private _time = 0;
    private _length = 0;
    private _sequence : ISpriteAnimationSequence[] = [];


    constructor (aniamtion) {
        this._length = aniamtion.animationTime;
        this._sequence = aniamtion.spriteSequence;

    }

    update (dt : number, texture : Texture) {
        this._time += dt;

        if (this._time > this._length) {
            this._time = 0;
            this._step = 0;

            texture.pos.x = this._sequence[this._step].x;
            texture.pos.y = this._sequence[this._step].y;
            texture.width = this._sequence[this._step].width;
            texture.height = this._sequence[this._step].height;

        } else {
            if(this._time > this._sequence[this._step].time) {
                while (this._time > this._sequence[this._step].time) {
                    this._step++;
                }
                texture.pos.x = this._sequence[this._step].x;
                texture.pos.y = this._sequence[this._step].y;
                texture.width = this._sequence[this._step].width;
                texture.height = this._sequence[this._step].height;
            }
        }

        //var lastKeyFrame = this._animations[this._step];
        //var nextKeyFrame = this._animations[this._step + 1];
        //
        //return {
        //    progress: (time - lastKeyFrame.time) / (nextKeyFrame.time - lastKeyFrame.time),  //TODO: calculate curve
        //    lastKeyFrame: lastKeyFrame,
        //    nextKeyFrame: nextKeyFrame
        //}
    }
}