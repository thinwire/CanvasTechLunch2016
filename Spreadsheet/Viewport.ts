/**
 * Viewport class provides help functions for managing
 * an offset viewing area
 */
class Viewport {
    private _x0: number = 0;
    private _y0: number = 0;
    private _x1: number = 1;
    private _y1: number = 1;

    private _posX: number = 0;
    private _posY: number = 0;
    private _viewMinX: number = 0;
    private _viewMaxX: number = 1;
    private _viewMinY: number = 0;
    private _viewMaxY: number = 1;

    private _xoffset: number = 0;
    private _yoffset: number = 0;
    private _width: number = 1;
    private _height: number = 1;

    private _minX: number = 0;
    private _maxX: number = 0;
    private _minY: number = 1;
    private _maxY: number = 1;

    // Set current position value
    public setPosition(x: number, y: number) {
        this._posX = x;
        this._posY = y;
        this.updatePosition();
    }

    // Set viewport bounds relative to the drawing area
    // These values always get applied to the x/y calculations
    public setViewport(w: number, h: number,
                       xoffset: number, yoffset: number): void {
        this._xoffset = xoffset;
        this._yoffset = yoffset;
        this._width = w;
        this._height = h;
        this.updateRange();
    }

    // Set value range. These are LOCAL values, relative to the "world" you're 
    // viewing into, rather than the screen
    public setWorldRange(minX: number, minY: number, maxX: number, maxY: number): void {
        this._minX = minX;
        this._minY = minY;
        this._maxX = maxX;
        this._maxY = maxY;
        this.updateRange();
    }

    // Recalculate view range values
    private updateRange(): void {
        var half_w = this._width * .5;
        var half_h = this._height * .5;

        this._viewMinX = Math.ceil(this._minX + half_w);
        this._viewMaxX = Math.floor(this._maxX - half_w);
        this._viewMinY = Math.ceil(this._minY + half_h);
        this._viewMaxY = Math.floor(this._maxY - half_h);
    }

    // Recalculate viewport bounds and clamp position value
    private updatePosition(): void {
        var half_w = this._width * .5;
        var half_h = this._height * .5;

        var x = this._posX = Math.max(this._viewMinX, Math.min(this._viewMaxX, this._posX));
        var y = this._posY = Math.max(this._viewMinY, Math.min(this._viewMaxY, this._posY));

        this._x0 = Math.floor(x - half_w);
        this._x1 = Math.ceil(x + half_w);
        this._y0 = Math.floor(y - half_h);
        this._y1 = Math.ceil(y + half_h);
    }

    /**
     * Check if a point is inside the view area (relative to canvas)
     */
    public isPointInside(x: number, y: number): boolean {
        return x >= this._xoffset  && y >= this._yoffset && 
        x < this._xoffset + this._width && y < this._yoffset + this._height;
    }

    public getScreenWidth(): number {
        return this._width;
    }

    public getScreenHeight(): number {
        return this._height;
    }

    public getScreenOffsetX(): number {
        return this._xoffset;
    }

    public getScreenOffsetY(): number {
        return this._yoffset;
    }

    public getWorldWidth(): number {
        return this._maxX - this._minX;
    }

    public getWorldHeight(): number {
        return this._maxY - this._minY;
    }

    public getViewableAreaX0(): number {
        return this._viewMinX;
    }

    public getViewableAreaX1(): number {
        return this._viewMaxX;
    }

    public getViewableAreaY0(): number {
        return this._viewMinY;
    }

    public getViewableAreaY1(): number {
        return this._viewMaxY;
    }

    public getWorldX0(): number {
        return this._x0;
    }

    public getWorldX1(): number {
        return this._x1;
    }

    public getWorldY0(): number {
        return this._y0;
    }

    public getWorldY1(): number {
        return this._y1;
    }

}
