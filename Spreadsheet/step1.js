var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;
var Spreadsheet = (function () {
    function Spreadsheet(canvas) {
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d");
        this.init();
        this.draw();
    }
    Spreadsheet.prototype.init = function () {
        this._canvas.width = this._canvas.offsetWidth;
        this._canvas.height = this._canvas.offsetHeight;
    };
    Spreadsheet.prototype.draw = function () {
        var ctx = this._context;
        var w = this._canvas.width | 0;
        var h = this._canvas.height | 0;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.beginPath();
        for (var y = 0; y < h; y += CELL_HEIGHT) {
            for (var x = 0; x < w; x += CELL_WIDTH) {
                ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT);
            }
        }
        ctx.strokeStyle = "#000";
        ctx.stroke();
    };
    return Spreadsheet;
})();
var ss = new Spreadsheet(document.getElementById("spreadsheet"));
