/*
 * Dirt-simple spreadsheet
 * Step 2: Draw line and column headers
 */

var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;
var LINE_NUM_WIDTH = 45;
var COL_TITLE_HEIGHT = 25;
var COL_HEADERS: string[] = []; 

class Spreadsheet {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    constructor(canvas: HTMLElement) {
        this._canvas = <HTMLCanvasElement>canvas;
        this._context = this._canvas.getContext("2d");

        this.init();
        this.draw();
    }

    /**
     * Initialize data, etc.
     */
    private init(): void {
        this._canvas.width = this._canvas.offsetWidth;
        this._canvas.height = this._canvas.offsetHeight;

        // Generate column headers
        var letters = [ "A", "B", "C", "D", "E", "F", "G", "H",
                        "I", "J", "K", "L", "M", "N", "O", "P",
                        "Q", "R", "S", "T", "U", "V", "W", "X",
                        "Y", "Z" ];
        
        // Just add single letters for now...
        for(var i = 0; i < letters.length; ++i) {
            COL_HEADERS.push(letters[i]);
        }
    }

    /**
     * Handle drawing of spreadsheet
     */
    private draw(): void {
        var ctx = this._context;
        var w: number = this._canvas.width | 0;
        var h: number = this._canvas.height | 0;

        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,w,h);

        // Draw title backgrounds
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.rect(0,0,LINE_NUM_WIDTH,h);
        ctx.rect(0,0,w,COL_TITLE_HEIGHT);
        ctx.fill();

        // Draw cells as boxes
        ctx.beginPath();
        for(var y = COL_TITLE_HEIGHT; y < h; y += CELL_HEIGHT) {
            for(var x = LINE_NUM_WIDTH; x < w; x += CELL_WIDTH) {
                ctx.rect(x,y,CELL_WIDTH,CELL_HEIGHT);
            }
        }        
        ctx.strokeStyle = "#000";
        ctx.stroke();

        // Draw line numbers
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        var line = 1;
        for(var y = COL_TITLE_HEIGHT; y < h; y += CELL_HEIGHT) {
            Spreadsheet.drawTextCentered(ctx,"" + line,10,0,y,LINE_NUM_WIDTH,CELL_HEIGHT);
            ++line;
        }
        
        // Draw column headers
        var col = 0;
        for(var x = LINE_NUM_WIDTH; x < w; x += CELL_WIDTH) {
            Spreadsheet.drawTextCentered(ctx,"" + COL_HEADERS[col++],10,x,0,CELL_WIDTH,COL_TITLE_HEIGHT);
        }
    }

    // Utility method for centering text inside a box
    private static drawTextCentered(ctx: CanvasRenderingContext2D, text: string, fontHeight: number, 
                                    x: number, y: number, w: number, h: number) {
        var metrics = ctx.measureText(text);
        ctx.fillText(text, x + (w * .5 - metrics.width * .5),y + (h * .5 - fontHeight * .5), w);
    }

}

var ss = new Spreadsheet(document.getElementById("spreadsheet"));