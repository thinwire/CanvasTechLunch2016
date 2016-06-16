/*
 * Dirt-simple spreadsheet
 * Step 1: Draw the initial grid
 */

var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;

class Spreadsheet {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    constructor(canvas: HTMLElement) {
        this._canvas = <HTMLCanvasElement>canvas;
        this._context = this._canvas.getContext("2d");

        this.init();
        this.draw();
    }

    private init(): void {
        this._canvas.width = this._canvas.offsetWidth;
        this._canvas.height = this._canvas.offsetHeight;
    }

    private draw(): void {
        var ctx = this._context;
        var w: number = this._canvas.width | 0;
        var h: number = this._canvas.height | 0;

        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,w,h);

        // Draw cells as boxes
        ctx.beginPath();
        for(var y = 0; y < h; y += CELL_HEIGHT) {
            for(var x = 0; x < w; x += CELL_WIDTH) {
                ctx.rect(x,y,CELL_WIDTH,CELL_HEIGHT);
            }
        }        
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }
}

var ss = new Spreadsheet(document.getElementById("spreadsheet"));