var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;
var LINE_NUM_WIDTH = 45;
var COL_TITLE_HEIGHT = 25;
var COL_HEADERS = [];
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
        var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        for (var i = 0; i < letters.length; ++i) {
            COL_HEADERS.push(letters[i]);
        }
    };
    Spreadsheet.prototype.draw = function () {
        var ctx = this._context;
        var w = this._canvas.width | 0;
        var h = this._canvas.height | 0;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.rect(0, 0, LINE_NUM_WIDTH, h);
        ctx.rect(0, 0, w, COL_TITLE_HEIGHT);
        ctx.fill();
        ctx.beginPath();
        for (var y = COL_TITLE_HEIGHT; y < h; y += CELL_HEIGHT) {
            for (var x = LINE_NUM_WIDTH; x < w; x += CELL_WIDTH) {
                ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT);
            }
        }
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        var line = 1;
        for (var y = COL_TITLE_HEIGHT; y < h; y += CELL_HEIGHT) {
            Spreadsheet.drawTextCentered(ctx, "" + line, 10, 0, y, LINE_NUM_WIDTH, CELL_HEIGHT);
            ++line;
        }
        var col = 0;
        for (var x = LINE_NUM_WIDTH; x < w; x += CELL_WIDTH) {
            Spreadsheet.drawTextCentered(ctx, "" + COL_HEADERS[col++], 10, x, 0, CELL_WIDTH, COL_TITLE_HEIGHT);
        }
    };
    Spreadsheet.drawTextCentered = function (ctx, text, fontHeight, x, y, w, h) {
        var metrics = ctx.measureText(text);
        ctx.fillText(text, x + (w * .5 - metrics.width * .5), y + (h * .5 - fontHeight * .5), w);
    };
    return Spreadsheet;
})();
var ss = new Spreadsheet(document.getElementById("spreadsheet"));
