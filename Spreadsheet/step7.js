var Rect = (function () {
    function Rect() {
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
    }
    Rect.prototype.hasPoint = function (x, y) {
        return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h;
    };
    return Rect;
})();
var Viewport = (function () {
    function Viewport() {
        this._x0 = 0;
        this._y0 = 0;
        this._x1 = 1;
        this._y1 = 1;
        this._posX = 0;
        this._posY = 0;
        this._viewMinX = 0;
        this._viewMaxX = 1;
        this._viewMinY = 0;
        this._viewMaxY = 1;
        this._xoffset = 0;
        this._yoffset = 0;
        this._width = 1;
        this._height = 1;
        this._minX = 0;
        this._maxX = 0;
        this._minY = 1;
        this._maxY = 1;
    }
    Viewport.prototype.setPosition = function (x, y) {
        this._posX = x;
        this._posY = y;
        this.updatePosition();
    };
    Viewport.prototype.setViewport = function (w, h, xoffset, yoffset) {
        this._xoffset = xoffset;
        this._yoffset = yoffset;
        this._width = w;
        this._height = h;
        this.updateRange();
    };
    Viewport.prototype.setWorldRange = function (minX, minY, maxX, maxY) {
        this._minX = minX;
        this._minY = minY;
        this._maxX = maxX;
        this._maxY = maxY;
        this.updateRange();
    };
    Viewport.prototype.updateRange = function () {
        var half_w = this._width * .5;
        var half_h = this._height * .5;
        this._viewMinX = Math.ceil(this._minX + half_w);
        this._viewMaxX = Math.floor(this._maxX - half_w);
        this._viewMinY = Math.ceil(this._minY + half_h);
        this._viewMaxY = Math.floor(this._maxY - half_h);
    };
    Viewport.prototype.updatePosition = function () {
        var half_w = this._width * .5;
        var half_h = this._height * .5;
        var x = this._posX = Math.max(this._viewMinX, Math.min(this._viewMaxX, this._posX));
        var y = this._posY = Math.max(this._viewMinY, Math.min(this._viewMaxY, this._posY));
        this._x0 = Math.floor(x - half_w);
        this._x1 = Math.ceil(x + half_w);
        this._y0 = Math.floor(y - half_h);
        this._y1 = Math.ceil(y + half_h);
    };
    Viewport.prototype.isPointInside = function (x, y) {
        return x >= this._xoffset && y >= this._yoffset && x < this._xoffset + this._width && y < this._yoffset + this._height;
    };
    Viewport.prototype.getScreenWidth = function () {
        return this._width;
    };
    Viewport.prototype.getScreenHeight = function () {
        return this._height;
    };
    Viewport.prototype.getScreenOffsetX = function () {
        return this._xoffset;
    };
    Viewport.prototype.getScreenOffsetY = function () {
        return this._yoffset;
    };
    Viewport.prototype.getWorldWidth = function () {
        return this._maxX - this._minX;
    };
    Viewport.prototype.getWorldHeight = function () {
        return this._maxY - this._minY;
    };
    Viewport.prototype.getViewableAreaX0 = function () {
        return this._viewMinX;
    };
    Viewport.prototype.getViewableAreaX1 = function () {
        return this._viewMaxX;
    };
    Viewport.prototype.getViewableAreaY0 = function () {
        return this._viewMinY;
    };
    Viewport.prototype.getViewableAreaY1 = function () {
        return this._viewMaxY;
    };
    Viewport.prototype.getWorldX0 = function () {
        return this._x0;
    };
    Viewport.prototype.getWorldX1 = function () {
        return this._x1;
    };
    Viewport.prototype.getWorldY0 = function () {
        return this._y0;
    };
    Viewport.prototype.getWorldY1 = function () {
        return this._y1;
    };
    return Viewport;
})();
var ScrollbarOrientation;
(function (ScrollbarOrientation) {
    ScrollbarOrientation[ScrollbarOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
    ScrollbarOrientation[ScrollbarOrientation["VERTICAL"] = 1] = "VERTICAL";
})(ScrollbarOrientation || (ScrollbarOrientation = {}));
var Scrollbar = (function () {
    function Scrollbar(canvas, orientation) {
        this._min = 0;
        this._max = 1;
        this._value = 0;
        this.onUpdate = function () {
        };
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._orientation = orientation;
        this._bounds = new Rect();
        this._dragger = new Rect();
        if (this._orientation == 0 /* HORIZONTAL */) {
            this._bounds.w = 100;
            this._bounds.h = 15;
        }
        else {
            this._bounds.w = 15;
            this._bounds.h = 100;
        }
        this._position = 0;
        this._min = 0;
        this._max = 100;
        this._value = 0;
        this.clampDragger();
    }
    Scrollbar.prototype.setPosition = function (x, y) {
        this._bounds.x = x;
        this._bounds.y = y;
        this.clampDragger();
    };
    Scrollbar.prototype.setSize = function (w, h) {
        this._bounds.w = w;
        this._bounds.h = h;
        this.clampDragger();
    };
    Scrollbar.prototype.setRange = function (min, max) {
        this._min = min;
        this._max = max;
        this.setValue(min);
        this.clampDragger();
    };
    Scrollbar.prototype.getValue = function () {
        return this._value;
    };
    Scrollbar.prototype.setValue = function (value) {
        this._value = Math.max(this._min, Math.min(this._max, value));
        this.positionDragger();
        this.onUpdate();
    };
    Scrollbar.prototype.positionDragger = function () {
        var rel = (this._value - this._min) / (this._max - this._min);
        if (this._orientation == 0 /* HORIZONTAL */) {
            var range = this._bounds.w - 10;
            this._dragger.x = this._bounds.x + rel * range;
        }
        else {
            var range = this._bounds.h - 10;
            this._dragger.y = this._bounds.y + rel * range;
        }
        this.clampDragger();
    };
    Scrollbar.prototype.clampDragger = function () {
        var x = this._dragger.x;
        var y = this._dragger.y;
        var w = this._dragger.h = 10;
        var h = this._dragger.w = 10;
        x = Math.max(this._bounds.x, Math.min(this._bounds.x + this._bounds.w - 10, x));
        y = Math.max(this._bounds.y, Math.min(this._bounds.y + this._bounds.h - 10, y));
        this._dragger.x = x;
        this._dragger.y = y;
    };
    Scrollbar.prototype.handleInput = function (e) {
        var _this = this;
        var mx = e.offsetX;
        var my = e.offsetY;
        if (this._dragger.hasPoint(mx, my)) {
            var mxdelta = e.offsetX - e.clientX;
            var mydelta = e.offsetY - e.clientY;
            var moveListener = function (ev) {
                var x = ev.clientX + mxdelta;
                var y = ev.clientY + mydelta;
                if (_this._orientation == 0 /* HORIZONTAL */) {
                    var rel_x = (x - _this._bounds.x) / (_this._bounds.w);
                    _this.setValue(_this._min + rel_x * (_this._max - _this._min));
                }
                else {
                    var rel_y = (y - _this._bounds.y) / (_this._bounds.h);
                    _this.setValue(_this._min + rel_y * (_this._max - _this._min));
                }
                ev.stopPropagation();
                ev.preventDefault();
            };
            var upListener = function (ev) {
                moveListener(ev);
                window.removeEventListener("mousemove", moveListener);
                window.removeEventListener("mouseup", upListener);
                ev.stopPropagation();
                ev.preventDefault();
            };
            window.addEventListener("mousemove", moveListener);
            window.addEventListener("mouseup", upListener);
            return true;
        }
        return false;
    };
    Scrollbar.prototype.draw = function () {
        var ctx = this._context;
        ctx.beginPath();
        ctx.fillStyle = "#333";
        ctx.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
        ctx.fillStyle = "#9f9";
        ctx.fillRect(this._dragger.x, this._dragger.y, this._dragger.w, this._dragger.h);
    };
    return Scrollbar;
})();
var CELL_WIDTH = 75;
var CELL_HEIGHT = 20;
var LINE_NUM_WIDTH = 45;
var LINE_COUNT = 100;
var COL_TITLE_HEIGHT = 25;
var COL_NAMES = [];
(function initNames() {
    var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    for (var i = 0; i < letters.length; ++i) {
        COL_NAMES.push(letters[i]);
    }
})();
var Spreadsheet = (function () {
    function Spreadsheet(canvas) {
        var _this = this;
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d");
        this._input = document.getElementById("cellValue");
        this._address = document.getElementById("cellTitle");
        this._cursorValid = false;
        this._input.addEventListener("keypress", function (ev) {
            if (ev.charCode == 13) {
                if (!_this._cursorValid)
                    return;
                _this.setCellData(_this._cursorX, _this._cursorY, _this._input.value);
            }
        });
        this._viewport = new Viewport();
        this._vscrollbar = new Scrollbar(this._canvas, 1 /* VERTICAL */);
        this._hscrollbar = new Scrollbar(this._canvas, 0 /* HORIZONTAL */);
        this._cursorX = 0;
        this._cursorY = 0;
        this.init();
    }
    Spreadsheet.prototype.init = function () {
        var _this = this;
        this._width = this._canvas.width = this._canvas.offsetWidth;
        this._height = this._canvas.height = this._canvas.offsetHeight;
        var scrollbar_size = 10;
        this._viewport.setViewport(this._width - scrollbar_size - LINE_NUM_WIDTH, this._height - scrollbar_size - COL_TITLE_HEIGHT, LINE_NUM_WIDTH, COL_TITLE_HEIGHT);
        this._viewport.setWorldRange(0, 0, COL_NAMES.length * CELL_WIDTH, CELL_HEIGHT * LINE_COUNT);
        this._viewport.setPosition(0, 0);
        this._vscrollbar.setPosition(this._width - scrollbar_size, COL_TITLE_HEIGHT);
        this._vscrollbar.setSize(scrollbar_size, this._height - COL_TITLE_HEIGHT - scrollbar_size);
        this._hscrollbar.setPosition(LINE_NUM_WIDTH, this._height - scrollbar_size);
        this._hscrollbar.setSize(this._width - LINE_NUM_WIDTH - scrollbar_size, scrollbar_size);
        this._vscrollbar.setRange(this._viewport.getViewableAreaY0(), this._viewport.getViewableAreaY1());
        this._hscrollbar.setRange(this._viewport.getViewableAreaX0(), this._viewport.getViewableAreaX1());
        this._vscrollbar.onUpdate = this._hscrollbar.onUpdate = function () {
            _this.update();
        };
        this._canvas.addEventListener("mousedown", function (e) {
            _this.mouseHandler(e);
        });
        this._canvas.addEventListener("mouseup", function (e) {
            _this.mouseHandler(e);
        });
        this._canvas.addEventListener("click", function (e) {
            _this.mouseHandler(e);
        });
        var egg = null;
        window.addEventListener("keydown", function (e) {
            if (e.keyCode == 36) {
                if (egg == null) {
                    egg = new Egg(_this._context);
                    egg.start();
                }
                else {
                    egg.stop();
                    egg = null;
                    _this.update();
                }
            }
        });
        this._celldata = [];
        for (var line = 0; line < LINE_COUNT; ++line) {
            for (var col = 0; col < COL_NAMES.length; ++col) {
                this._celldata.push("");
            }
        }
        this.update();
    };
    Spreadsheet.prototype.mouseHandler = function (e) {
        switch (e.type) {
            case "mousedown":
                if (this._vscrollbar.handleInput(e) || this._hscrollbar.handleInput(e)) {
                }
                this.update();
                break;
            case "mouseup":
                break;
            case "click":
                this.placeCursor(e.offsetX, e.offsetY);
                this.update();
                break;
        }
    };
    Spreadsheet.prototype.placeCursor = function (x, y) {
        if (!this._viewport.isPointInside(x, y)) {
            return;
        }
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;
        x -= offsx;
        y -= offsy;
        x += cellOffsetX;
        y += cellOffsetY;
        var clickedX = (x / CELL_WIDTH) | 0;
        var clickedY = (y / CELL_HEIGHT) | 0;
        this._cursorX = cellX0 + clickedX;
        this._cursorY = cellY0 + clickedY;
        this._input.value = this.getCellData(this._cursorX, this._cursorY);
        this._address.innerText = "Cell " + COL_NAMES[this._cursorX] + "" + (this._cursorY + 1) + " value";
        this._cursorValid = true;
    };
    Spreadsheet.prototype.getCellData = function (col, line) {
        return this._celldata[col + (line * COL_NAMES.length)];
    };
    Spreadsheet.prototype.setCellData = function (col, line, value) {
        this._celldata[col + (line * COL_NAMES.length)] = value;
        this.update();
    };
    Spreadsheet.prototype.update = function () {
        var _this = this;
        requestAnimationFrame(function () {
            _this.draw();
        });
    };
    Spreadsheet.prototype.draw = function () {
        this._viewport.setPosition(this._hscrollbar.getValue(), this._vscrollbar.getValue());
        this.drawBackground();
        this.drawCells();
        this.drawHeaders();
        this.drawScrollbars();
        this._context.beginPath();
    };
    Spreadsheet.prototype.drawBackground = function () {
        var ctx = this._context;
        var w = this._width | 0;
        var h = this._height | 0;
        ctx.fillStyle = "#fff";
        ctx.fillRect(LINE_NUM_WIDTH, COL_TITLE_HEIGHT, w, h);
    };
    Spreadsheet.prototype.drawHeaders = function () {
        var ctx = this._context;
        var w = this._width | 0;
        var h = this._height | 0;
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;
        var wcells = Math.ceil(this._viewport.getScreenWidth() / CELL_WIDTH) + 1;
        var hcells = Math.ceil(this._viewport.getScreenHeight() / CELL_HEIGHT);
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.rect(0, 0, LINE_NUM_WIDTH, h);
        ctx.rect(0, 0, w, COL_TITLE_HEIGHT);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        var line = cellY0 + 1;
        for (var y = 0; y < hcells; ++y) {
            var py = offsy - cellOffsetY + (y * CELL_HEIGHT);
            Spreadsheet.drawTextCentered(ctx, "" + line, 10, 0, py, LINE_NUM_WIDTH, CELL_HEIGHT);
            ++line;
        }
        var col = cellX0;
        for (var x = 0; x < wcells; ++x) {
            var px = offsx - cellOffsetX + (x * CELL_WIDTH);
            Spreadsheet.drawTextCentered(ctx, "" + COL_NAMES[col++], 10, px, 0, CELL_WIDTH, COL_TITLE_HEIGHT);
        }
        ctx.beginPath();
        ctx.fillStyle = "#777";
        ctx.fillRect(0, 0, LINE_NUM_WIDTH, COL_TITLE_HEIGHT);
    };
    Spreadsheet.prototype.drawCells = function () {
        var ctx = this._context;
        var offsx = this._viewport.getScreenOffsetX();
        var offsy = this._viewport.getScreenOffsetY();
        var x0 = this._viewport.getWorldX0();
        var y0 = this._viewport.getWorldY0();
        var cellX0 = (x0 / CELL_WIDTH) | 0;
        var cellY0 = (y0 / CELL_HEIGHT) | 0;
        var cellOffsetX = x0 - cellX0 * CELL_WIDTH;
        var cellOffsetY = y0 - cellY0 * CELL_HEIGHT;
        var wcells = Math.ceil(this._viewport.getScreenWidth() / CELL_WIDTH) + 1;
        var hcells = Math.ceil(this._viewport.getScreenHeight() / CELL_HEIGHT);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        for (var y = 0; y < hcells; ++y) {
            for (var x = 0; x < wcells; ++x) {
                var cx = offsx - cellOffsetX + (x * CELL_WIDTH);
                var cy = offsy - cellOffsetY + (y * CELL_HEIGHT);
                ctx.rect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
                var data = this.getCellData(cellX0 + x, cellY0 + y);
                Spreadsheet.drawTextCentered(ctx, data, 10, cx, cy, CELL_WIDTH, CELL_HEIGHT);
            }
        }
        ctx.strokeStyle = "#000";
        ctx.stroke();
        {
            ctx.beginPath();
            ctx.fillStyle = "#aaf";
            ctx.strokeStyle = "#f11";
            var cx = offsx - cellOffsetX + (this._cursorX - cellX0) * CELL_WIDTH;
            var cy = offsy - cellOffsetY + (this._cursorY - cellY0) * CELL_HEIGHT;
            ctx.rect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#fff";
            var data = this.getCellData(this._cursorX, this._cursorY);
            Spreadsheet.drawTextCentered(ctx, data, 10, cx, cy, CELL_WIDTH, CELL_HEIGHT);
        }
    };
    Spreadsheet.prototype.drawScrollbars = function () {
        var ctx = this._context;
        var w = this._width | 0;
        var h = this._height | 0;
        ctx.beginPath();
        ctx.fillStyle = "#444";
        ctx.fillRect(w - 10, h - 10, 10, 10);
        this._vscrollbar.draw();
        this._hscrollbar.draw();
    };
    Spreadsheet.drawTextCentered = function (ctx, text, fontHeight, x, y, w, h) {
        var metrics = ctx.measureText(text);
        ctx.fillText(text, x + (w * .5 - metrics.width * .5), y + (h * .5 - fontHeight * .5), w);
    };
    return Spreadsheet;
})();
var Egg = (function () {
    function Egg(ctx) {
        this._x = [];
        this._y = [];
        this._z = [];
        this._p = ctx;
        var c = this._c = 256;
        for (var i = 0; i < c; ++i) {
            this._x.push(-100 + (Math.random() * 200));
            this._y.push(-100 + (Math.random() * 200));
            this._z.push(Math.random());
        }
    }
    Egg.prototype.loop = function (t) {
        var _this = this;
        var ctx = this._p;
        var d = (t - this._t) * .0001;
        this._t = t;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "#fff";
        for (var i = 0; i < this._c; ++i) {
            var x = this._x[i];
            var y = this._y[i];
            var z = this._z[i] - d;
            if (z < 0)
                z += 1;
            this._z[i] = z;
            ctx.fillRect(400 + x / z, 300 + y / z, 2, 2);
        }
        if (this._c) {
            requestAnimationFrame(function (t2) {
                _this.loop(t2);
            });
        }
    };
    Egg.prototype.start = function () {
        var _this = this;
        requestAnimationFrame(function (t) {
            _this._t = t;
            _this.loop(t + .001);
        });
    };
    Egg.prototype.stop = function () {
        this._c = 0;
    };
    return Egg;
})();
var ss = new Spreadsheet(document.getElementById("spreadsheet"));
