/*
 * Dirt-simple spreadsheet
 * Step 5: Add data editing capability
 * 
 * Hook events into input field and info span
 */

/// <reference path="Rect.ts" />
/// <reference path="Viewport.ts" />
/// <reference path="Scrollbar.ts" />

var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;
var LINE_NUM_WIDTH = 45;
var LINE_COUNT = 100;           // Increase line count for more data area
var COL_TITLE_HEIGHT = 25;
var COL_NAMES: string[] = [];

(function initNames() {
    // Generate column headers
    var letters = [ "A", "B", "C", "D", "E", "F", "G", "H",
                    "I", "J", "K", "L", "M", "N", "O", "P",
                    "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z" ];
    
    // First, add single letters
    for(var i = 0; i < letters.length; ++i) {
        COL_NAMES.push(letters[i]);
    }

    /*
     * This section is commented out because scrolling becomes difficult
     * once your data area grows too large... Experiment with different 
     * ranges of the outer loop.
     * 
     * The size of the data area does not measurably impact rendering speed.
     *
    // Add double letter combinations
    for(var i = 0; i < letters.length; ++i) {
        for(var j = 0; j < letters.length; ++j) {
            COL_NAMES.push(letters[i] + "" + letters[j]);
        }
    }
    */
})();

class Spreadsheet {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;

    private _viewport: Viewport;
    private _vscrollbar: Scrollbar;
    private _hscrollbar: Scrollbar;

    private _cursorValid: boolean;
    private _cursorX: number;
    private _cursorY: number;

    private _celldata: string[];
    private _input: HTMLInputElement;
    private _address: HTMLSpanElement;

    constructor(canvas: HTMLElement) {
        this._canvas = <HTMLCanvasElement>canvas;
        this._context = this._canvas.getContext("2d");
        
        this._input = <HTMLInputElement>document.getElementById("cellValue");
        this._address = <HTMLSpanElement>document.getElementById("cellTitle");

        this._cursorValid = false;
        this._input.addEventListener("keypress", (ev: KeyboardEvent) => {
            if(ev.charCode == 13) /* enter */ {
                if(!this._cursorValid) return;
                this.setCellData(this._cursorX,this._cursorY,this._input.value);
            }
        });

        this._viewport = new Viewport();
        this._vscrollbar = new Scrollbar(this._canvas,ScrollbarOrientation.VERTICAL);
        this._hscrollbar = new Scrollbar(this._canvas,ScrollbarOrientation.HORIZONTAL);

        this._cursorX = 0;
        this._cursorY = 0;

        this.init();
    }

    /**
     * Initialize data, etc.
     */
    private init(): void {
        this._width = this._canvas.width = this._canvas.offsetWidth;
        this._height = this._canvas.height = this._canvas.offsetHeight;

        var scrollbar_size = 10;

        // Calculate viewport bounds
        this._viewport.setViewport(this._width - scrollbar_size - LINE_NUM_WIDTH,
                                   this._height - scrollbar_size - COL_TITLE_HEIGHT,
                                   LINE_NUM_WIDTH, COL_TITLE_HEIGHT);

        this._viewport.setWorldRange(0,0,COL_NAMES.length * CELL_WIDTH,CELL_HEIGHT * LINE_COUNT);

        // Position auto-clamps
        this._viewport.setPosition(0,0);

        // Place scrollbars
        this._vscrollbar.setPosition(this._width - scrollbar_size, COL_TITLE_HEIGHT);
        this._vscrollbar.setSize(scrollbar_size, this._height - COL_TITLE_HEIGHT - scrollbar_size);

        this._hscrollbar.setPosition(LINE_NUM_WIDTH, this._height - scrollbar_size);
        this._hscrollbar.setSize(this._width - LINE_NUM_WIDTH - scrollbar_size, scrollbar_size);

        // Set scrollbar value range
        this._vscrollbar.setRange(this._viewport.getViewableAreaY0(), this._viewport.getViewableAreaY1());
        this._hscrollbar.setRange(this._viewport.getViewableAreaX0(), this._viewport.getViewableAreaX1());

        // Register mouse handling
        this._canvas.addEventListener("mousedown", (e) => { this.mouseHandler(e) });
        this._canvas.addEventListener("mouseup", (e) => { this.mouseHandler(e) });
        this._canvas.addEventListener("click", (e) => { this.mouseHandler(e) });

        // Initialize cell data array
        this._celldata = [];
        for(var line = 0; line < LINE_COUNT; ++line) {
            for(var col = 0; col < COL_NAMES.length; ++col) {
                this._celldata.push("");
            }
        }

        // Start animator loop
        var animLoop = () => {
            this.draw();
            requestAnimationFrame(animLoop);
        };
        requestAnimationFrame(animLoop)
    }

    /*
     * Handle and forward mouse events 
     */
    private mouseHandler(e: MouseEvent): void {
        switch(e.type) {
            case "mousedown":
                if(this._vscrollbar.handleInput(e) || this._hscrollbar.handleInput(e)) {
                    e.preventDefault();
                }
            break;
            case "mouseup":
            break;
            case "click":
                this.placeCursor(e.offsetX, e.offsetY);
            break;
        }
    }

    /*
     * Place the cursor based on where we've clicked in the canvas  
     */
    private placeCursor(x: number, y: number): void {

        // Make sure we clicked in viewport...
        if(!this._viewport.isPointInside(x,y)) {
            return;
        } 

        // Use viewport to figure out on which cell the click landed
        // Code is copied from a draw routine

        // Display area offset
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();

        // World top x and y coordinates visible on screen
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();

        // First cell index in x and y direction
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;

        // Offset of first cells
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;

        // Apply offsets to mouse coordinates
        x -= offsx;
        y -= offsy;
        x += cellOffsetX;
        y += cellOffsetY;

        // Figure out the relative clicked cell
        var clickedX = (x / CELL_WIDTH) | 0;
        var clickedY = (y / CELL_HEIGHT) | 0;

        // Set new cursor indices
        this._cursorX = cellX0 + clickedX;
        this._cursorY = cellY0 + clickedY;

        this._input.value = this.getCellData(this._cursorX,this._cursorY);
        this._address.innerText = "Cell " + COL_NAMES[this._cursorX] + "" + (this._cursorY + 1) + " value";

        this._cursorValid = true;
    }

    /**
     * Get the string stored in a cell
     */
    private getCellData(col: number, line: number): string {
        return this._celldata[col + (line * COL_NAMES.length)];
    }

    /**
     * Set value of a cell
     */
    private setCellData(col: number, line: number, value: string): void {
        this._celldata[col + (line * COL_NAMES.length)] = value;
    }

    /**
     * Handle drawing of spreadsheet
     */
    private draw(): void {

        //
        // For now, our draw loop is also our update loop
        // Therefore, we update viewport position here, every frame
        // from scrollbar values.
        //

        this._viewport.setPosition(this._hscrollbar.getValue(), this._vscrollbar.getValue());

        //
        // Call draw routines in order
        //

        this.drawBackground();
        this.drawCells();
        this.drawHeaders();
        this.drawScrollbars();

        // Forget any and all path information...
        this._context.beginPath();
    }

    /*
     * Draw a white background, essentially clearing the main draw area 
     */
    private drawBackground(): void {
        var ctx = this._context;
        var w: number = this._width | 0;
        var h: number = this._height | 0;

        // Draw main background
        ctx.fillStyle = "#fff";
        ctx.fillRect(LINE_NUM_WIDTH,COL_TITLE_HEIGHT,w,h); // auto-clamped
    }

    /*
     * Draw line numbers and column titles 
     */
    private drawHeaders(): void {
        var ctx = this._context;
        var w: number = this._width | 0;
        var h: number = this._height | 0;

        // Display area offset
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();

        // World top x and y coordinates visible on screen
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();

        // First cell index in x and y direction
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;

        // Offset of first cells
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;

        // Number of cells to draw horizontally and vertically
        var wcells = Math.ceil(this._viewport.getScreenWidth() / CELL_WIDTH) + 1;
        var hcells = Math.ceil(this._viewport.getScreenHeight() / CELL_HEIGHT);

        // Draw header backgrounds
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.rect(0,0,LINE_NUM_WIDTH,h);
        ctx.rect(0,0,w,COL_TITLE_HEIGHT);
        ctx.fill();

        // Draw line numbers
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.textBaseline = "top";
        ctx.textAlign = "start";

        var line = cellY0 + 1; // We want the text to start at 1, not 0...
        for(var y = 0; y < hcells; ++y) {
            var py = offsy - cellOffsetY + (y * CELL_HEIGHT); 
            Spreadsheet.drawTextCentered(ctx,"" + line,10,0,py,LINE_NUM_WIDTH,CELL_HEIGHT);
            ++line;
        }
        
        // Draw column headers
        var col = cellX0;
        for(var x = 0; x < wcells; ++x) {
            var px = offsx - cellOffsetX + (x * CELL_WIDTH);
            Spreadsheet.drawTextCentered(ctx,"" + COL_NAMES[col++],10,px,0,CELL_WIDTH,COL_TITLE_HEIGHT);
        } 

        // Fill the overflow
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.fillRect(0,0,LINE_NUM_WIDTH,COL_TITLE_HEIGHT);
    }

    /*
     * Draw cell grid
     */
    private drawCells(): void {
        var ctx = this._context;

        // Display area offset
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();

        // World top x and y coordinates visible on screen
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();

        // First cell index in x and y direction
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;

        // Offset of first cells
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;

        // Number of cells to draw horizontally and vertically
        var wcells = Math.ceil(this._viewport.getScreenWidth() / CELL_WIDTH) + 1;
        var hcells = Math.ceil(this._viewport.getScreenHeight() / CELL_HEIGHT);

        // Draw cells
        ctx.fillStyle = "#000";
        ctx.beginPath();
        for(var y = 0; y < hcells; ++y) {
            for(var x = 0; x < wcells; ++x) {
                // We now do the necessary arithmetic per cell 

                var cx = offsx - cellOffsetX + (x * CELL_WIDTH);
                var cy = offsy - cellOffsetY + (y * CELL_HEIGHT);

                ctx.rect(cx,cy,CELL_WIDTH,CELL_HEIGHT);

                // Draw cell data
                var data: string = this.getCellData(cellX0 + x, cellY0 + y);
                Spreadsheet.drawTextCentered(ctx, data, 10, cx, cy, CELL_WIDTH, CELL_HEIGHT);
            }
        }        
        ctx.strokeStyle = "#000";
        ctx.stroke();

        // Draw cursor
        {    
            ctx.beginPath();
            ctx.fillStyle = "#aaf";
            ctx.strokeStyle = "#f11";

            var cx = offsx - cellOffsetX + (this._cursorX - cellX0) * CELL_WIDTH;
            var cy = offsy - cellOffsetY + (this._cursorY - cellY0) * CELL_HEIGHT;

            ctx.rect(cx,cy,CELL_WIDTH,CELL_HEIGHT);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fff";
            var data: string = this.getCellData(this._cursorX, this._cursorY);
            Spreadsheet.drawTextCentered(ctx, data, 10, cx, cy, CELL_WIDTH, CELL_HEIGHT);
        }
    }

    /*
     * Draw scrollbar objects and clean up dead space left by them
     */
    private drawScrollbars(): void {

        var ctx = this._context;
        var w: number = this._width | 0;
        var h: number = this._height | 0;

        // Fill the area between the scrollbars
        ctx.beginPath();
        ctx.fillStyle = "#444";
        ctx.fillRect(w - 10, h - 10, 10, 10);

        // Call scrollbar object draw routines
        this._vscrollbar.draw();
        this._hscrollbar.draw();
    }

    // Utility method for centering text inside a box
    private static drawTextCentered(ctx: CanvasRenderingContext2D, text: string, fontHeight: number, 
                                    x: number, y: number, w: number, h: number) {
        var metrics = ctx.measureText(text);
        ctx.fillText(text, x + (w * .5 - metrics.width * .5),y + (h * .5 - fontHeight * .5), w);
    }

}

var ss = new Spreadsheet(document.getElementById("spreadsheet"));