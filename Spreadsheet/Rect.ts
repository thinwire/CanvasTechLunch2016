/**
 * Very simple rectangle struct, we'll need this to check
 * for clicks inside areas...
 */
class Rect {
    public x: number = 0;
    public y: number = 0;
    public w: number = 1;
    public h: number = 1;

    public hasPoint(x: number, y: number): boolean {
        return x >= this.x && x < this.x + this.w &&
               y >= this.y && y < this.y + this.h;
    }
}
