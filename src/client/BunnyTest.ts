module ZombieApp {
    export class BunnyTest {
        fps = 1000;
        fpsBuffer = [];
        bunnies = [];
        bunny = {
            x: 0, y: 0,
            width: 26,
            height: 37,
            img: undefined
        };

        constructor(public bunnyFactory : (bunny) => Object) {
            this.bunny.img = new Image();
            this.bunny.img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAlCAMAAABruAmEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2QTQzRTc1NTc4ODcxMUUzOEQxMkE0OTRDQkQwMDMzOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2QTQzRTc1Njc4ODcxMUUzOEQxMkE0OTRDQkQwMDMzOCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZBNDNFNzUzNzg4NzExRTM4RDEyQTQ5NENCRDAwMzM4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjZBNDNFNzU0Nzg4NzExRTM4RDEyQTQ5NENCRDAwMzM4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+7rWcSQAAABhQTFRFuIMEAAAA////hV4D66YFBVH8+/z/////WwonSQAAAAh0Uk5T/////////wDeg71ZAAAAqElEQVR42szT2Q6EIAwF0C6M/P8f24VCKcbMyyRznyonYqkK3YKaregdXKBJZAnbKBIRkVEU3xGm7ISUgokUPjOKi3xhRC4SXbpLhOhKJIGZOHR0KCsDAErzr7TyQPHISakHorhNOwFkSSF/D04MZ9A3rOYbehtm9hpNcodKzSaoWKmN6f4vRfNP53o5cprTQRyTPog5rFJ8a1ruNH6qVP+IOk5Z9S3AAGaxDdAzQYF8AAAAAElFTkSuQmCC';
        }

        addBunny() {
            console.log("Bunny Added");
            for (var i = 0; i < 10; i++) {
                this.bunnies.push(this.bunnyFactory(this.bunny));
            }
        }

        start() {
            var timer = setInterval(() => {
                if (this.fps > 56) {
                    this.addBunny();
                } else {
                    clearInterval(timer);
                    console.info('Total Bunnies Running: ' + this.bunnies.length);
                }
            }, 200);
        }

        update(dt : number) {
            if (this.fpsBuffer.length > 64) {
                var sum = 0;
                for (var i = 0; i < this.fpsBuffer.length; i++) {
                    sum += this.fpsBuffer[i];
                }
                this.fps = ~~(sum / this.fpsBuffer.length);
                this.fpsBuffer = [];
            }
            this.fpsBuffer.push(60 / (dt * 6));
        }
    }
}