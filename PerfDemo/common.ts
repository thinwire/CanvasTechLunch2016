/*
 * Common code for Canvas vs. HTML rendering speed test
 * 
 * Displays a bunch of car images moving in different
 * directions.
 */

var SCREEN_WIDTH: number = 800;
var SCREEN_HEIGHT: number = 600;

var CAR_WIDTH = 128;
var CAR_HEIGHT = 64;

var images: HTMLImageElement[] = [
    <HTMLImageElement>document.getElementById("car1"),
    <HTMLImageElement>document.getElementById("car2"),
    <HTMLImageElement>document.getElementById("car3"),
    <HTMLImageElement>document.getElementById("car4"),
    <HTMLImageElement>document.getElementById("car5")
];

/*
 * Generic Car object 
 */
class Car {
    private _x: number;
    private _y: number;
    private _dx: number;
    private _dy: number;
    private _img: number;

    constructor() {
        this._x = Math.random() * SCREEN_WIDTH;
        this._y = Math.random() * SCREEN_HEIGHT;
        this._img = (Math.random() * images.length) | 0;
        this.setSpeed(Math.random() * 360.0, 10 + Math.random() * 100);
    }

    public getX(): number {
        return this._x;
    }

    public getY(): number {
        return this._y;
    }

    public getImage(): HTMLImageElement {
        return images[this._img];
    }

    public setSpeed(angle: number, speed: number): void {
        var a = angle * Math.PI / 180.0;
        this._dx = Math.cos(a) * speed;
        this._dy = Math.sin(a) * speed;
    }

    public update(delta:number): void {
        this._x += this._dx * delta;
        this._y += this._dy * delta;
        while(this._x > SCREEN_WIDTH + (CAR_WIDTH * .5)) {
            this._x -= SCREEN_WIDTH + CAR_WIDTH;
        }
        while(this._x < (CAR_WIDTH * -.5)) {
            this._x += SCREEN_WIDTH + CAR_WIDTH;
        }

        while(this._y > SCREEN_HEIGHT + (CAR_HEIGHT * .5)) {
            this._y -= SCREEN_HEIGHT + CAR_HEIGHT;
        }
        while(this._y < (CAR_HEIGHT * -.5)) {
            this._y += SCREEN_HEIGHT + CAR_HEIGHT;
        }
    }
}

/*
 * Renderer interface provides
 * ability to hook up new rendering function  
 */
interface Renderer {
     init: (cars: Car[]) => void;
     draw: (cars: Car[]) => void;
     carsUpdated: (cars: Car[], first: number) => void;
}

/*
 * Main control structure 
 */
class Perftest {
    private _cars: Car[];
    private _stats: HTMLElement;
    private _renderer: Renderer;

    constructor() {
        this._cars = [];
        this._stats = document.getElementById("stats");
        this.addCars(50);

        document.addEventListener("keypress", (ev) => {
            if(ev.charCode == 32) /* space */ {
                this.addCars(10);
            }
        });
    }

    public addCars(count: number): void {
        var first = this._cars.length;
        for(var i = 0; i < count; ++i) {
            this._cars.push(new Car());
        }
        if(this._renderer) {
            this._renderer.carsUpdated(this._cars,first);
        }
        this.updateStats(0);
    }

    public start(renderer: Renderer) {
        var fps = 0;
        var tm_stat = 0;
        var tm_last = null;
        var callback = (time:number) => {
            var delta;
            if(tm_last == null) {
                tm_last = time;
                delta = 0;
            } else {
                delta = time - tm_last;
                tm_last = time;
                delta *= 0.001;
            }

            tm_stat += delta;
            if(tm_stat > 1) {
                this.updateStats(fps);
                tm_stat = 0;
                fps = 0;
            } else {
                fps++;
            }

            for(var i = 0, l = this._cars.length; i < l; ++i) {
                this._cars[i].update(delta);
            }

            renderer.draw(this._cars);
            window.requestAnimationFrame(callback);
        };
        window.requestAnimationFrame(callback);
        
        this._renderer = renderer;
        renderer.init(this._cars);
    }

    private updateStats(fps:number): void {
        this._stats.innerText = "Cars: " + this._cars.length + ", FPS: " + fps;
    }
}
