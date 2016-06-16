/// <reference path="Rect.ts" />

/**
 * Scrollbar orientation values - these get eliminated by
 * the compiler in the end...
 */
enum ScrollbarOrientation {
    HORIZONTAL,
    VERTICAL
}

/**
 * Simple custom scrollbar object
 * Minimum dragger size is 10 pixels, it won't go lower than that.
 * 
 * This class makes several (possibly false) assumptions and doesn't
 * bother to scale the drag handles to represent value range vs. visual
 * range. This is left as an exercise for the reader. 
 */
class Scrollbar {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _bounds: Rect;
    private _dragger: Rect;
    private _orientation: ScrollbarOrientation;

    private _position: number;

    private _min: number = 0;
    private _max: number = 1;
    private _value: number = 0;

    public onUpdate: () => void = () => {};

    constructor(canvas: HTMLCanvasElement, orientation: ScrollbarOrientation) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._orientation = orientation;
        
        this._bounds = new Rect();
        this._dragger = new Rect();

        if(this._orientation == ScrollbarOrientation.HORIZONTAL) {
            this._bounds.w = 100;
            this._bounds.h = 15;
        } else {
            this._bounds.w = 15;
            this._bounds.h = 100;
        }

        this._position = 0;

        this._min = 0;
        this._max = 100;
        this._value = 0;
        this.clampDragger();
    }

    public setPosition(x: number, y: number): void {
        this._bounds.x = x;
        this._bounds.y = y;
        this.clampDragger();
    }

    public setSize(w: number, h: number): void {
        this._bounds.w = w;
        this._bounds.h = h;
        this.clampDragger();
    }

    public setRange(min: number, max: number): void {
        this._min = min;
        this._max = max;
        this.setValue(min);
        this.clampDragger();
    }

    public getValue(): number {
        return this._value;
    }

    public setValue(value: number): void {
        this._value = Math.max(this._min,Math.min(this._max,value));
        this.positionDragger();
        this.onUpdate();
    }

    /*
     * Calculate dragger position based on current value
     */
    private positionDragger(): void {
        var rel = (this._value - this._min) / (this._max - this._min);

        if(this._orientation == ScrollbarOrientation.HORIZONTAL) {
            var range = this._bounds.w - 10;
            this._dragger.x = this._bounds.x + rel * range;
        } else {
            var range = this._bounds.h - 10;
            this._dragger.y = this._bounds.y + rel * range;
        }

        this.clampDragger();
    }

    /*
     * Make sure dragger doesn't escape the scrollbar
     */
    private clampDragger(): void {
        var x = this._dragger.x;
        var y = this._dragger.y;
        var w = this._dragger.h = 10;
        var h = this._dragger.w = 10;

        x = Math.max(this._bounds.x,Math.min(this._bounds.x + this._bounds.w - 10, x));
        y = Math.max(this._bounds.y,Math.min(this._bounds.y + this._bounds.h - 10, y));

        this._dragger.x = x;
        this._dragger.y = y;
    }

    public handleInput(e:MouseEvent): boolean {

        // Coordinates relative to canvas
        var mx = e.offsetX;
        var my = e.offsetY;

        if(this._dragger.hasPoint(mx,my)) {

            // Delta values - add to client coordinates
            // to convert back to canvas coordinates
            var mxdelta = e.offsetX - e.clientX;
            var mydelta = e.offsetY - e.clientY;

            var moveListener = (ev: MouseEvent) => {

                // Scrollbar-relative X and Y
                var x = ev.clientX + mxdelta;
                var y = ev.clientY + mydelta;

                if(this._orientation == ScrollbarOrientation.HORIZONTAL) {
                    // Calculate position relative to bounds
                    // Zero is at bounds.x, max is at bounds.x + bounds.w
                    var rel_x = (x - this._bounds.x) / (this._bounds.w);

                    // Set value by multiplying range by rel_x
                    this.setValue(this._min + rel_x * (this._max - this._min));

                    // setValue takes care of clamping and other adjustments
                } else {
                    // Ditto for vertical
                    var rel_y = (y - this._bounds.y) / (this._bounds.h);
                    this.setValue(this._min + rel_y * (this._max - this._min));
                }

                ev.stopPropagation();
                ev.preventDefault();
            };

            var upListener = (ev: MouseEvent) => {
                moveListener(ev);
                window.removeEventListener("mousemove",moveListener);
                window.removeEventListener("mouseup",upListener);
                ev.stopPropagation();
                ev.preventDefault();
            };

            window.addEventListener("mousemove", moveListener);
            window.addEventListener("mouseup", upListener);
            return true;
        }

        return false;
    }

    public draw(): void {
        var ctx = this._context;

        ctx.beginPath();
        ctx.fillStyle = "#333";
        ctx.fillRect(this._bounds.x,this._bounds.y,this._bounds.w,this._bounds.h);
        ctx.fillStyle = "#9f9";
        ctx.fillRect(this._dragger.x,this._dragger.y,this._dragger.w,this._dragger.h);
    }

}
