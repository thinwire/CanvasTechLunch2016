/*
 * Canvas rendering implementation
 * of car performance demo
 *  
 */

/// <reference path="common.ts" />

class CanvasRenderer implements Renderer {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    constructor() {
        this._canvas = <HTMLCanvasElement>document.getElementById("output");
        this._context = this._canvas.getContext("2d");
    }

    public init(cars: Car[]): void {
        // Set canvas context size
        this._canvas.width = SCREEN_WIDTH;
        this._canvas.height =  SCREEN_HEIGHT;
    }

    public carsUpdated(cars: Car[], first: number): void {
        // No need to update
    }

    public draw(cars: Car[]): void {
        var ctx = this._context;

        // Clear screen
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.rect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
        ctx.fill();
        ctx.beginPath();

        // Draw all car sprites
        for(var i = 0, l = cars.length; i < l; ++i) {
            var car = cars[i];
            ctx.drawImage(car.getImage(),car.getX() - CAR_WIDTH * .5,car.getY() - CAR_HEIGHT * .5);
        }
    }

}


var ptest = new Perftest();
ptest.start(new CanvasRenderer());
